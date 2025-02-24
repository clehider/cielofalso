<template>
  <div class="crm">
    <h1 class="page-title">Gestión de Clientes (CRM)</h1>

    <!-- Panel Principal -->
    <div class="crm-container">
      <!-- Panel de Búsqueda y Acciones -->
      <div class="actions-panel">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar clientes..."
          >
        </div>
        <button 
          class="btn-nuevo"
          @click="mostrarModalNuevoCliente = true"
        >
          Nuevo Cliente
        </button>
      </div>

      <!-- Lista de Clientes -->
      <div class="clientes-grid">
        <div class="table-container">
          <table class="clientes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Última Interacción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                <td>{{ cliente.nombre }}</td>
                <td>{{ cliente.telefono }}</td>
                <td>
                  <span :class="['tipo-badge', `tipo-${cliente.tipo}`]">
                    {{ cliente.tipo }}
                  </span>
                </td>
                <td>
                  <span :class="['estado-badge', `estado-${cliente.estado}`]">
                    {{ cliente.estado }}
                  </span>
                </td>
                <td>{{ formatDate(cliente.ultimaInteraccion) }}</td>
                <td class="acciones">
                  <button 
                    class="btn-action"
                    @click="verDetalleCliente(cliente)"
                  >
                    Ver
                  </button>
                  <button 
                    class="btn-action"
                    @click="nuevaInteraccion(cliente)"
                  >
                    Interacción
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Cliente -->
    <div v-if="mostrarModalNuevoCliente" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nuevo Cliente</h2>
          <button @click="mostrarModalNuevoCliente = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarCliente">
            <div class="form-group">
              <label>Nombre Completo:</label>
              <input 
                type="text" 
                v-model="nuevoCliente.nombre"
                required
              >
            </div>
            <div class="form-group">
              <label>CI/NIT:</label>
              <input 
                type="text" 
                v-model="nuevoCliente.ciNit"
              >
            </div>
            <div class="form-group">
              <label>Teléfono:</label>
              <input 
                type="tel" 
                v-model="nuevoCliente.telefono"
                required
              >
            </div>
            <div class="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                v-model="nuevoCliente.email"
              >
            </div>
            <div class="form-group">
              <label>Dirección:</label>
              <input 
                type="text" 
                v-model="nuevoCliente.direccion"
              >
            </div>
            <div class="form-group">
              <label>Tipo de Cliente:</label>
              <select v-model="nuevoCliente.tipo">
                <option value="potencial">Potencial</option>
                <option value="activo">Activo</option>
                <option value="preferente">Preferente</option>
              </select>
            </div>
            <div class="form-actions">
              <button 
                type="submit" 
                class="btn-guardar"
              >Guardar</button>
              <button 
                type="button" 
                class="btn-cancelar"
                @click="mostrarModalNuevoCliente = false"
              >Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Cliente -->
    <div v-if="clienteSeleccionado" class="modal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Detalle del Cliente</h2>
          <button @click="clienteSeleccionado = null">×</button>
        </div>
        <div class="modal-body">
          <div class="cliente-detalle">
            <!-- Información básica -->
            <div class="seccion">
              <h3>Información Personal</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Nombre:</span>
                  <span>{{ clienteSeleccionado.nombre }}</span>
                </div>
                <div class="info-item">
                  <span class="label">CI/NIT:</span>
                  <span>{{ clienteSeleccionado.ciNit }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Teléfono:</span>
                  <span>{{ clienteSeleccionado.telefono }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span>{{ clienteSeleccionado.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span>{{ clienteSeleccionado.direccion }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Tipo:</span>
                  <span :class="['tipo-badge', `tipo-${clienteSeleccionado.tipo}`]">
                    {{ clienteSeleccionado.tipo }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Servicios Activos -->
            <div class="seccion">
              <h3>Servicios Activos</h3>
              <div class="servicios-lista">
                <div 
                  v-for="servicio in clienteSeleccionado.servicios" 
                  :key="servicio.id"
                  class="servicio-item"
                >
                  <div class="servicio-info">
                    <h4>{{ servicio.nombre }}</h4>
                    <p>{{ servicio.descripcion }}</p>
                    <p class="servicio-fecha">
                      Inicio: {{ formatDate(servicio.fechaInicio) }}
                    </p>
                  </div>
                  <div class="servicio-acciones">
                    <button 
                      class="btn-action"
                      @click="reimprimirRecibo(servicio)"
                    >
                      Reimprimir Recibo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Historial de Interacciones -->
            <div class="seccion">
              <h3>Historial de Interacciones</h3>
              <div class="interacciones-lista">
                <div 
                  v-for="interaccion in clienteSeleccionado.interacciones" 
                  :key="interaccion.id"
                  class="interaccion-item"
                >
                  <div class="interaccion-header">
                    <span class="fecha">{{ formatDate(interaccion.fecha) }}</span>
                    <span :class="['tipo-interaccion', interaccion.tipo]">
                      {{ interaccion.tipo }}
                    </span>
                  </div>
                  <p class="interaccion-detalle">{{ interaccion.detalle }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Interacción -->
    <div v-if="mostrarModalInteraccion" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nueva Interacción</h2>
          <button @click="mostrarModalInteraccion = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarInteraccion">
            <div class="form-group">
              <label>Tipo de Interacción:</label>
              <select v-model="nuevaInteraccion.tipo" required>
                <option value="consulta">Consulta</option>
                <option value="cita">Cita</option>
                <option value="reunion">Reunión</option>
                <option value="servicio">Nuevo Servicio</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha:</label>
              <input 
                type="datetime-local" 
                v-model="nuevaInteraccion.fecha"
                required
              >
            </div>
            <div class="form-group">
              <label>Detalle:</label>
              <textarea 
                v-model="nuevaInteraccion.detalle"
                required
                rows="4"
              ></textarea>
            </div>
            <div class="form-actions">
              <button 
                type="submit" 
                class="btn-guardar"
              >Guardar</button>
              <button 
                type="button" 
                class="btn-cancelar"
                @click="mostrarModalInteraccion = false"
              >Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'CRM',
  setup() {
    const clientes = ref([])
    const busqueda = ref('')
    const mostrarModalNuevoCliente = ref(false)
    const mostrarModalInteraccion = ref(false)
    const clienteSeleccionado = ref(null)
    
    const nuevoCliente = ref({
      nombre: '',
      ciNit: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo: 'potencial',
      estado: 'activo',
      servicios: [],
      interacciones: []
    })

    const nuevaInteraccion = ref({
      tipo: 'consulta',
      fecha: '',
      detalle: ''
    })

    const clientesFiltrados = computed(() => {
      return clientes.value.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        cliente.telefono.includes(busqueda.value)
      )
    })

    const cargarClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clientes'))
        clientes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          ultimaInteraccion: doc.data().ultimaInteraccion?.toDate()
        }))
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        alert('Error al cargar los clientes')
      }
    }

    const guardarCliente = async () => {
      try {
        const clienteData = {
          ...nuevoCliente.value,
          fechaRegistro: serverTimestamp(),
          ultimaInteraccion: serverTimestamp()
        }

        await addDoc(collection(db, 'clientes'), clienteData)
        
        mostrarModalNuevoCliente.value = false
        nuevoCliente.value = {
          nombre: '',
          ciNit: '',
          telefono: '',
          email: '',
          direccion: '',
          tipo: 'potencial',
          estado: 'activo',
          servicios: [],
          interacciones: []
        }
        
        await cargarClientes()
        alert('Cliente guardado con éxito')
      } catch (error) {
        console.error('Error al guardar cliente:', error)
        alert('Error al guardar el cliente')
      }
    }

    const verDetalleCliente = (cliente) => {
      clienteSeleccionado.value = cliente
    }

    const nuevaInteraccion = (cliente) => {
      clienteSeleccionado.value = cliente
      mostrarModalInteraccion.value = true
      nuevaInteraccion.value = {
        tipo: 'consulta',
        fecha: new Date().toISOString().slice(0, 16),
        detalle: ''
      }
    }

    const guardarInteraccion = async () => {
      if (!clienteSeleccionado.value) return

      try {
        const clienteRef = doc(db, 'clientes', clienteSeleccionado.value.id)
        
        const interaccion = {
          ...nuevaInteraccion.value,
          fecha: new Date(nuevaInteraccion.value.fecha),
          id: Date.now().toString()
        }

        await updateDoc(clienteRef, {
          interacciones: [...clienteSeleccionado.value.interacciones, interaccion],
          ultimaInteraccion: serverTimestamp()
        })

        mostrarModalInteraccion.value = false
        await cargarClientes()
        
        // Actualizar cliente seleccionado
        const clienteActualizado = clientes.value.find(
          c => c.id === clienteSeleccionado.value.id
        )
        if (clienteActualizado) {
          clienteSeleccionado.value = clienteActualizado
        }

        alert('Interacción registrada con éxito')
      } catch (error) {
        console.error('Error al guardar interacción:', error)
        alert('Error al guardar la interacción')
      }
    }

    const reimprimirRecibo = (servicio) => {
      // Implementaremos la reimpresión en la siguiente parte
      alert('Funcionalidad de reimpresión en desarrollo')
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString()
    }

    onMounted(cargarClientes)

    return {
      clientes,
      busqueda,
      mostrarModalNuevoCliente,
      mostrarModalInteraccion,
      clienteSeleccionado,
      nuevoCliente,
      nuevaInteraccion,
      clientesFiltrados,
      guardarCliente,
      verDetalleCliente,
      nuevaInteraccion,
      guardarInteraccion,
      reimprimirRecibo,
      formatDate
    }
  }
}
</script>

<style scoped>
.crm {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.crm-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.actions-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 8px 8px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn-nuevo {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.table-container {
  overflow-x: auto;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.clientes-table th,
.clientes-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.clientes-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.tipo-badge,
.estado-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.tipo-potencial { background-color: #ffd700; color: #000; }
.tipo-activo { background-color: #4CAF50; color: white; }
.tipo-preferente { background-color: #2196F3; color: white; }

.estado-activo { background-color: #4CAF50; color: white; }
.estado-inactivo { background-color: #f44336; color: white; }

.btn-action {
  padding: 4px 8px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: white;
  background-color: #2196F3;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-guardar {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancelar {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cliente-detalle {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.seccion {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
}

.seccion h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-weight: bold;
  color: #666;
}

.servicios-lista,
.interacciones-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.servicio-item,
.interaccion-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.servicio-info h4 {
  margin: 0;
  color: #2c3e50;
}

.servicio-fecha {
  color: #666;
  font-size: 0.9rem;
}

.interaccion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.tipo-interaccion {
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 12px;
  background-color: #e9ecef;
}

.interaccion-detalle {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .actions-panel {
    flex-direction: column;
    gap: 10px;
  }

  .search-box {
    max-width: 100%;
  }

  .btn-nuevo {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<script>
// ... (mantener el script existente y agregar lo siguiente al final del setup())

const mostrarModalServicio = ref(false)
const nuevoServicio = ref({
  nombre: '',
  descripcion: '',
  monto: 0,
  metodoPago: 'efectivo',
  estado: 'pendiente',
  fechaInicio: ''
})

const agregarServicio = async () => {
  if (!clienteSeleccionado.value) return

  try {
    const servicioData = {
      ...nuevoServicio.value,
      id: Date.now().toString(),
      fechaInicio: new Date(nuevoServicio.value.fechaInicio)
    }

    const clienteRef = doc(db, 'clientes', clienteSeleccionado.value.id)
    
    // Agregar el servicio al cliente
    await updateDoc(clienteRef, {
      servicios: [...clienteSeleccionado.value.servicios, servicioData]
    })

    // Registrar en caja chica si el pago es inmediato
    if (nuevoServicio.value.estado === 'pagado') {
      await addDoc(collection(db, 'cajaChica'), {
        fecha: serverTimestamp(),
        tipo: 'ingreso',
        descripcion: `Servicio: ${servicioData.nombre} - Cliente: ${clienteSeleccionado.value.nombre}`,
        monto: servicioData.monto,
        metodoPago: servicioData.metodoPago
      })
    }

    // Generar y descargar el recibo
    const { generarReciboPDF } = await import('../services/crmPdfService')
    generarReciboPDF(servicioData, clienteSeleccionado.value).download(
      `recibo_${servicioData.id}.pdf`
    )

    mostrarModalServicio.value = false
    nuevoServicio.value = {
      nombre: '',
      descripcion: '',
      monto: 0,
      metodoPago: 'efectivo',
      estado: 'pendiente',
      fechaInicio: ''
    }

    await cargarClientes()
    
    // Actualizar cliente seleccionado
    const clienteActualizado = clientes.value.find(
      c => c.id === clienteSeleccionado.value.id
    )
    if (clienteActualizado) {
      clienteSeleccionado.value = clienteActualizado
    }

    alert('Servicio registrado con éxito')
  } catch (error) {
    console.error('Error al registrar servicio:', error)
    alert('Error al registrar el servicio')
  }
}

const reimprimirRecibo = async (servicio) => {
  try {
    const { generarReciboPDF } = await import('../services/crmPdfService')
    generarReciboPDF(servicio, clienteSeleccionado.value).download(
      `recibo_${servicio.id}.pdf`
    )
  } catch (error) {
    console.error('Error al reimprimir recibo:', error)
    alert('Error al reimprimir el recibo')
  }
}

const generarReporteCliente = async (cliente) => {
  try {
    const { generarReporteClientePDF } = await import('../services/crmPdfService')
    generarReporteClientePDF(cliente).download(
      `reporte_${cliente.id}_${new Date().toISOString().split('T')[0]}.pdf`
    )
  } catch (error) {
    console.error('Error al generar reporte:', error)
    alert('Error al generar el reporte')
  }
}

// Agregar al return
return {
  // ... (mantener los returns existentes)
  mostrarModalServicio,
  nuevoServicio,
  agregarServicio,
  generarReporteCliente
}
</script>

<!-- Agregar el siguiente template dentro del componente existente, justo antes del cierre del último </div> -->
<!-- Modal Nuevo Servicio -->
<div v-if="mostrarModalServicio" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Nuevo Servicio</h2>
      <button @click="mostrarModalServicio = false">×</button>
    </div>
    <div class="modal-body">
      <form @submit.prevent="agregarServicio">
        <div class="form-group">
          <label>Nombre del Servicio:</label>
          <input 
            type="text" 
            v-model="nuevoServicio.nombre"
            required
          >
        </div>
        <div class="form-group">
          <label>Descripción:</label>
          <textarea 
            v-model="nuevoServicio.descripcion"
            required
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Monto:</label>
          <input 
            type="number" 
            v-model.number="nuevoServicio.monto"
            required
            min="0"
            step="0.01"
          >
        </div>
        <div class="form-group">
          <label>Método de Pago:</label>
          <select v-model="nuevoServicio.metodoPago">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="qr">QR</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estado:</label>
          <select v-model="nuevoServicio.estado">
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha de Inicio:</label>
          <input 
            type="datetime-local" 
            v-model="nuevoServicio.fechaInicio"
            required
          >
        </div>
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-guardar"
          >Guardar</button>
          <button 
            type="button" 
            class="btn-cancelar"
            @click="mostrarModalServicio = false"
          >Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Agregar los siguientes estilos al final del <style> existente -->
<style scoped>
/* Agregar al final de los estilos existentes */
.servicio-estado {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.estado-pendiente {
  background-color: #ffd700;
  color: #000;
}

.estado-pagado {
  background-color: #4CAF50;
  color: white;
}

.estado-en_proceso {
  background-color: #2196F3;
  color: white;
}

.estado-completado {
  background-color: #9c27b0;
  color: white;
}

.acciones-cliente {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-reporte {
  background-color: #673ab7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-servicio {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
<script>
// ... (mantener el script existente y agregar lo siguiente al final del setup())

const mostrarModalServicio = ref(false)
const nuevoServicio = ref({
  nombre: '',
  descripcion: '',
  monto: 0,
  metodoPago: 'efectivo',
  estado: 'pendiente',
  fechaInicio: ''
})

const agregarServicio = async () => {
  if (!clienteSeleccionado.value) return

  try {
    const servicioData = {
      ...nuevoServicio.value,
      id: Date.now().toString(),
      fechaInicio: new Date(nuevoServicio.value.fechaInicio)
    }

    const clienteRef = doc(db, 'clientes', clienteSeleccionado.value.id)
    
    // Agregar el servicio al cliente
    await updateDoc(clienteRef, {
      servicios: [...clienteSeleccionado.value.servicios, servicioData]
    })

    // Registrar en caja chica si el pago es inmediato
    if (nuevoServicio.value.estado === 'pagado') {
      await addDoc(collection(db, 'cajaChica'), {
        fecha: serverTimestamp(),
        tipo: 'ingreso',
        descripcion: `Servicio: ${servicioData.nombre} - Cliente: ${clienteSeleccionado.value.nombre}`,
        monto: servicioData.monto,
        metodoPago: servicioData.metodoPago
      })
    }

    // Generar y descargar el recibo
    const { generarReciboPDF } = await import('../services/crmPdfService')
    generarReciboPDF(servicioData, clienteSeleccionado.value).download(
      `recibo_${servicioData.id}.pdf`
    )

    mostrarModalServicio.value = false
    nuevoServicio.value = {
      nombre: '',
      descripcion: '',
      monto: 0,
      metodoPago: 'efectivo',
      estado: 'pendiente',
      fechaInicio: ''
    }

    await cargarClientes()
    
    // Actualizar cliente seleccionado
    const clienteActualizado = clientes.value.find(
      c => c.id === clienteSeleccionado.value.id
    )
    if (clienteActualizado) {
      clienteSeleccionado.value = clienteActualizado
    }

    alert('Servicio registrado con éxito')
  } catch (error) {
    console.error('Error al registrar servicio:', error)
    alert('Error al registrar el servicio')
  }
}

const reimprimirRecibo = async (servicio) => {
  try {
    const { generarReciboPDF } = await import('../services/crmPdfService')
    generarReciboPDF(servicio, clienteSeleccionado.value).download(
      `recibo_${servicio.id}.pdf`
    )
  } catch (error) {
    console.error('Error al reimprimir recibo:', error)
    alert('Error al reimprimir el recibo')
  }
}

const generarReporteCliente = async (cliente) => {
  try {
    const { generarReporteClientePDF } = await import('../services/crmPdfService')
    generarReporteClientePDF(cliente).download(
      `reporte_${cliente.id}_${new Date().toISOString().split('T')[0]}.pdf`
    )
  } catch (error) {
    console.error('Error al generar reporte:', error)
    alert('Error al generar el reporte')
  }
}

// Agregar al return
return {
  // ... (mantener los returns existentes)
  mostrarModalServicio,
  nuevoServicio,
  agregarServicio,
  generarReporteCliente
}
</script>

<!-- Agregar el siguiente template dentro del componente existente, justo antes del cierre del último </div> -->
<!-- Modal Nuevo Servicio -->
<div v-if="mostrarModalServicio" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Nuevo Servicio</h2>
      <button @click="mostrarModalServicio = false">×</button>
    </div>
    <div class="modal-body">
      <form @submit.prevent="agregarServicio">
        <div class="form-group">
          <label>Nombre del Servicio:</label>
          <input 
            type="text" 
            v-model="nuevoServicio.nombre"
            required
          >
        </div>
        <div class="form-group">
          <label>Descripción:</label>
          <textarea 
            v-model="nuevoServicio.descripcion"
            required
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Monto:</label>
          <input 
            type="number" 
            v-model.number="nuevoServicio.monto"
            required
            min="0"
            step="0.01"
          >
        </div>
        <div class="form-group">
          <label>Método de Pago:</label>
          <select v-model="nuevoServicio.metodoPago">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="qr">QR</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estado:</label>
          <select v-model="nuevoServicio.estado">
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha de Inicio:</label>
          <input 
            type="datetime-local" 
            v-model="nuevoServicio.fechaInicio"
            required
          >
        </div>
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-guardar"
          >Guardar</button>
          <button 
            type="button" 
            class="btn-cancelar"
            @click="mostrarModalServicio = false"
          >Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Agregar los siguientes estilos al final del <style> existente -->
<style scoped>
/* Agregar al final de los estilos existentes */
.servicio-estado {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.estado-pendiente {
  background-color: #ffd700;
  color: #000;
}

.estado-pagado {
  background-color: #4CAF50;
  color: white;
}

.estado-en_proceso {
  background-color: #2196F3;
  color: white;
}

.estado-completado {
  background-color: #9c27b0;
  color: white;
}

.acciones-cliente {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-reporte {
  background-color: #673ab7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-servicio {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
