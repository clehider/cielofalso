<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>
    <p class="welcome-text">Bienvenido al sistema de gestión.</p>

    <div class="cards-grid">
      <router-link to="/ventas" class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3z"/>
            <path d="M7 7h10M7 12h10M7 17h10"/>
          </svg>
        </div>
        <h2>Ventas</h2>
        <p>Gestionar ventas y facturación</p>
      </router-link>

      <router-link to="/inventario" class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <h2>Inventario</h2>
        <p>Control de productos y stock</p>
      </router-link>

      <router-link to="/caja-chica" class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <path d="M16 14h.01M12 14h.01M8 14h.01"/>
          </svg>
        </div>
        <h2>Caja Chica</h2>
        <p>Control de ingresos y gastos</p>
      </router-link>

      <div class="card" @click="mostrarModalClientes">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2>Clientes</h2>
        <p>Gestión de clientes</p>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Gestión de Clientes</h2>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tabs">
            <button 
              class="tab-button" 
              :class="{ active: tabActiva === 'clientes' }"
              @click="tabActiva = 'clientes'"
            >
              Clientes
            </button>
            <button 
              class="tab-button" 
              :class="{ active: tabActiva === 'agenda' }"
              @click="cambiarTab('agenda')"
            >
              Agenda
            </button>
          </div>

          <div v-if="tabActiva === 'clientes'">
            <div class="actions-bar">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="busqueda" 
                  placeholder="Buscar clientes..."
                  class="search-input"
                >
              </div>
              <button 
                @click="mostrarFormulario = true"
                class="btn-primary"
              >
                + Nuevo Cliente
              </button>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>CI/NIT</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="4" class="text-center">Cargando...</td>
                  </tr>
                  <tr v-else-if="clientesFiltrados.length === 0">
                    <td colspan="4" class="text-center">No hay clientes registrados</td>
                  </tr>
                  <tr v-else v-for="cliente in clientesFiltrados" :key="cliente.id">
                    <td>{{ cliente.nombre }}</td>
                    <td>{{ cliente.ciNit }}</td>
                    <td>{{ cliente.telefono }}</td>
                    <td>
                      <button 
                        @click="editarCliente(cliente)"
                        class="btn-action"
                      >
                        Editar
                      </button>
                      <button 
                        @click="verHistorial(cliente)"
                        class="btn-action"
                      >
                        Historial
                      </button>
                      <button 
                        @click="agendarCita(cliente)"
                        class="btn-action"
                      >
                        Agendar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="tabActiva === 'agenda'">
            <div class="actions-bar">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="busquedaAgenda" 
                  placeholder="Buscar citas..."
                  class="search-input"
                >
              </div>
              <button 
                @click="mostrarFormularioCita = true"
                class="btn-primary"
              >
                + Nueva Cita
              </button>
            </div>

            <div class="calendar-view">
              <div class="calendar-header">
                <button @click="cambiarSemana(-1)" class="btn-icon">&lt;</button>
                <h3>{{ formatoSemana }}</h3>
                <button @click="cambiarSemana(1)" class="btn-icon">&gt;</button>
              </div>
              
              <div class="calendar-grid">
                <div class="time-column">
                  <div v-for="hora in horas" :key="hora" class="time-slot">
                    {{ hora }}
                  </div>
                </div>
                <div 
                  v-for="dia in diasSemana" 
                  :key="dia.fecha" 
                  class="day-column"
                >
                  <div class="day-header">
                    {{ dia.nombre }}
                    <small>{{ dia.fecha }}</small>
                  </div>
                  <div 
                    v-for="hora in horas" 
                    :key="hora"
                    class="calendar-cell"
                    @click="crearCita(dia.fecha, hora)"
                  >
                    <div 
                      v-for="cita in citasPorFechaHora(dia.fecha, hora)" 
                      :key="cita.id"
                      class="appointment-chip"
                      :class="cita.estado"
                      @click.stop="editarCita(cita)"
                    >
                      {{ cita.cliente.nombre }} - {{ cita.servicio }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mostrarFormulario" class="modal">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>{{ clienteEditar ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
          <button @click="cerrarFormulario" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarCliente">
            <div class="form-group">
              <label>Nombre Completo:</label>
              <input 
                type="text" 
                v-model="clienteForm.nombre"
                required
              >
            </div>
            <div class="form-group">
              <label>CI/NIT:</label>
              <input 
                type="text" 
                v-model="clienteForm.ciNit"
              >
            </div>
            <div class="form-group">
              <label>Teléfono:</label>
              <input 
                type="tel" 
                v-model="clienteForm.telefono"
                required
              >
            </div>
            <div class="form-group">
              <label>Dirección:</label>
              <input 
                type="text" 
                v-model="clienteForm.direccion"
              >
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                {{ clienteEditar ? 'Actualizar' : 'Guardar' }}
              </button>
              <button 
                type="button" 
                @click="cerrarFormulario" 
                class="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="mostrarFormularioCita" class="modal">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>{{ citaEditar ? 'Editar Cita' : 'Nueva Cita' }}</h2>
          <button @click="cerrarFormularioCita" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarCita">
            <div class="form-group">
              <label>Cliente:</label>
              <select v-model="citaForm.clienteId" required>
                <option value="">Seleccione un cliente</option>
                <option 
                  v-for="cliente in clientes" 
                  :key="cliente.id" 
                  :value="cliente.id"
                >
                  {{ cliente.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha:</label>
              <input 
                type="date" 
                v-model="citaForm.fecha"
                required
              >
            </div>
            <div class="form-group">
              <label>Hora:</label>
              <select v-model="citaForm.hora" required>
                <option v-for="hora in horas" :key="hora" :value="hora">
                  {{ hora }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Servicio:</label>
              <input 
                type="text" 
                v-model="citaForm.servicio"
                required
                placeholder="Ej: Corte de cabello"
              >
            </div>
            <div class="form-group">
              <label>Estado:</label>
              <select v-model="citaForm.estado" required>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notas:</label>
              <textarea 
                v-model="citaForm.notas"
                rows="3"
                placeholder="Detalles adicionales..."
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                {{ citaEditar ? 'Actualizar' : 'Guardar' }}
              </button>
              <button 
                type="button" 
                @click="cerrarFormularioCita" 
                class="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { collection, addDoc, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'Dashboard',
  setup() {
    const mostrarModal = ref(false)
    const mostrarFormulario = ref(false)
    const loading = ref(true)
    const clientes = ref([])
    const busqueda = ref('')
    const clienteEditar = ref(null)
    const clienteForm = ref({
      nombre: '',
      ciNit: '',
      telefono: '',
      direccion: ''
    })

    const tabActiva = ref('clientes')
    const mostrarFormularioCita = ref(false)
    const citaEditar = ref(null)
    const busquedaAgenda = ref('')
    const citas = ref([])
    const semanaActual = ref(new Date())
    
    const citaForm = ref({
      clienteId: '',
      fecha: '',
      hora: '',
      servicio: '',
      estado: 'pendiente',
      notas: ''
    })

    const horas = [
      '08:00', '09:00', '10:00', '11:00', '12:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00'
    ]

    const clientesFiltrados = computed(() => {
      return clientes.value.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        cliente.ciNit.includes(busqueda.value) ||
        cliente.telefono.includes(busqueda.value)
      )
    })

    const diasSemana = computed(() => {
      const dias = []
      const inicio = new Date(semanaActual.value)
      inicio.setDate(inicio.getDate() - inicio.getDay())
      
      for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicio)
        fecha.setDate(inicio.getDate() + i)
        dias.push({
          nombre: new Intl.DateTimeFormat('es', { weekday: 'short' }).format(fecha),
          fecha: fecha.toISOString().split('T')[0]
        })
      }
      
      return dias
    })

    const formatoSemana = computed(() => {
      const inicio = diasSemana.value[0].fecha
      const fin = diasSemana.value[6].fecha
      return `${formatearFecha(inicio)} - ${formatearFecha(fin)}`
    })

    const mostrarModalClientes = async () => {
      mostrarModal.value = true
      await cargarClientes()
    }

    const cargarClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clientes'))
        clientes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        alert('Error al cargar los clientes')
      } finally {
        loading.value = false
      }
    }

    const guardarCliente = async () => {
      try {
        if (clienteEditar.value) {
          await updateDoc(doc(db, 'clientes', clienteEditar.value.id), clienteForm.value)
        } else {
          await addDoc(collection(db, 'clientes'), {
            ...clienteForm.value,
            fechaRegistro: new Date()
          })
        }
        
        await cargarClientes()
        cerrarFormulario()
        alert(clienteEditar.value ? 'Cliente actualizado con éxito' : 'Cliente guardado con éxito')
      } catch (error) {
        console.error('Error al guardar cliente:', error)
        alert('Error al guardar el cliente')
      }
    }

    const editarCliente = (cliente) => {
      clienteEditar.value = cliente
      clienteForm.value = { ...cliente }
      mostrarFormulario.value = true
    }

    const verHistorial = (cliente) => {
      alert('Funcionalidad de historial en desarrollo')
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      loading.value = true
      clientes.value = []
      busqueda.value = ''
      tabActiva.value = 'clientes'
    }

    const cerrarFormulario = () => {
      mostrarFormulario.value = false
      clienteEditar.value = null
      clienteForm.value = {
        nombre: '',
        ciNit: '',
        telefono: '',
        direccion: ''
      }
    }

    const cambiarSemana = (delta) => {
      const nueva = new Date(semanaActual.value)
      nueva.setDate(nueva.getDate() + (delta * 7))
      semanaActual.value = nueva
    }

    const formatearFecha = (fecha) => {
      return new Intl.DateTimeFormat('es', {
        day: 'numeric',
        month: 'short'
      }).format(new Date(fecha))
    }

    const citasPorFechaHora = (fecha, hora) => {
      return citas.value.filter(cita => 
        cita.fecha === fecha && cita.hora === hora
      )
    }

    const cambiarTab = async (tab) => {
      tabActiva.value = tab
      if (tab === 'agenda') {
        await cargarCitas()
      }
    }

    const cargarCitas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'citas'))
        const citasPromises = querySnapshot.docs.map(async citaDoc => {
          const citaData = citaDoc.data()
          const clienteRef = doc(db, 'clientes', citaData.clienteId)
          const clienteSnap = await getDoc(clienteRef)
          
          if (clienteSnap.exists()) {
            return {
              id: citaDoc.id,
              ...citaData,
              cliente: {
                id: clienteSnap.id,
                ...clienteSnap.data()
              }
            }
          }
          return null
        })

        const citasResueltas = await Promise.all(citasPromises)
        citas.value = citasResueltas.filter(cita => cita !== null)
      } catch (error) {
        console.error('Error al cargar citas:', error)
        alert('Error al cargar las citas')
      }
    }

    const guardarCita = async () => {
      try {
        if (citaEditar.value) {
          await updateDoc(doc(db, 'citas', citaEditar.value.id), citaForm.value)
        } else {
          await addDoc(collection(db, 'citas'), {
            ...citaForm.value,
            fechaCreacion: new Date()
          })
        }
        
        await cargarCitas()
        cerrarFormularioCita()
        alert(citaEditar.value ? 'Cita actualizada con éxito' : 'Cita guardada con éxito')
      } catch (error) {
        console.error('Error al guardar cita:', error)
        alert('Error al guardar la cita')
      }
    }

    const crearCita = (fecha, hora) => {
      citaForm.value = {
        clienteId: '',
        fecha,
        hora,
        servicio: '',
        estado: 'pendiente',
        notas: ''
      }
      mostrarFormularioCita.value = true
    }

    const editarCita = (cita) => {
      citaEditar.value = cita
      citaForm.value = { ...cita }
      mostrarFormularioCita.value = true
    }

    const cerrarFormularioCita = () => {
      mostrarFormularioCita.value = false
      citaEditar.value = null
      citaForm.value = {
        clienteId: '',
        fecha: '',
        hora: '',
        servicio: '',
        estado: 'pendiente',
        notas: ''
      }
    }

    const agendarCita = (cliente) => {
      citaForm.value.clienteId = cliente.id
      mostrarFormularioCita.value = true
    }

    return {
      mostrarModal,
      mostrarFormulario,
      loading,
      clientes,
      busqueda,
      clienteEditar,
      clienteForm,
      clientesFiltrados,
      mostrarModalClientes,
      guardarCliente,
      editarCliente,
      verHistorial,
      cerrarModal,
      cerrarFormulario,
      tabActiva,
      mostrarFormularioCita,
      citaEditar,
      citaForm,
      busquedaAgenda,
      citas,
      horas,
      diasSemana,
      formatoSemana,
      semanaActual,
      cambiarSemana,
      citasPorFechaHora,
      guardarCita,
      crearCita,
      editarCita,
      cerrarFormularioCita,
      agendarCita,
      cambiarTab
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-title {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.welcome-text {
  color: #666;
  margin-bottom: 30px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.card-icon {
  background: #4a69bd;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.icon {
  width: 30px;
  height: 30px;
  color: white;
}

.card h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm {
  max-width: 500px;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  background-color: #4a69bd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.btn-action {
  padding: 4px 8px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4a69bd;
  color: white;
}

.text-center {
  text-align: center;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #4a69bd;
  border-bottom-color: #4a69bd;
}

.calendar-view {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  color: #4a69bd;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background: #eee;
  overflow-x: auto;
}

.time-column {
  background: #f8f9fa;
}

.time-slot {
  height: 60px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #666;
}

.day-column {
  background: white;
}

.day-header {
  padding: 8px;
  text-align: center;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.day-header small {
  display: block;
  color: #666;
  font-size: 0.8rem;
}

.calendar-cell {
  height: 60px;
  padding: 4px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.calendar-cell:hover {
  background: #f8f9fa;
}

.appointment-chip {
  background: #4a69bd;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 4px;
  cursor: pointer;
}

.appointment-chip.pendiente {
  background: #ffd43b;
  color: #000;
}

.appointment-chip.confirmada {
  background: #4a69bd;
}

.appointment-chip.cancelada {
  background: #ff6b6b;
}

.appointment-chip.completada {
  background: #51cf66;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .btn-primary {
    width: 100%;
  }

  .calendar-grid {
    grid-template-columns: 60px repeat(7, 120px);
  }
  
  .calendar-header h3 {
    font-size: 1rem;
  }
  
  .day-header {
    font-size: 0.8rem;
  }
}
</style>
