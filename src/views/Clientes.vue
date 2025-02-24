<template>
  <div class="clientes">
    <h1 class="page-title">Gestión de Clientes</h1>
    
    <div class="content-box">
      <!-- Panel de Acciones -->
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
          @click="mostrarModalNuevo = true"
          class="btn-primary"
        >
          + Nuevo Cliente
        </button>
      </div>

      <!-- Tabla de Clientes -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CI/NIT</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Última Compra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center">Cargando...</td>
            </tr>
            <tr v-else-if="clientesFiltrados.length === 0">
              <td colspan="6" class="text-center">No hay clientes registrados</td>
            </tr>
            <tr v-else v-for="cliente in clientesFiltrados" :key="cliente.id">
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.ciNit }}</td>
              <td>{{ cliente.telefono }}</td>
              <td>{{ cliente.direccion }}</td>
              <td>{{ formatDate(cliente.ultimaCompra) }}</td>
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuevo/Editar Cliente -->
    <div v-if="mostrarModalNuevo || clienteEditar" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ clienteEditar ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
          <button @click="cerrarModal" class="btn-close">&times;</button>
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
                @click="cerrarModal" 
                class="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Historial -->
    <div v-if="mostrarHistorial" class="modal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Historial del Cliente</h2>
          <button @click="mostrarHistorial = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="cliente-info">
            <h3>{{ clienteSeleccionado?.nombre }}</h3>
            <p>CI/NIT: {{ clienteSeleccionado?.ciNit }}</p>
            <p>Teléfono: {{ clienteSeleccionado?.telefono }}</p>
          </div>
          
          <h4>Compras Realizadas</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!comprasCliente.length">
                <td colspan="4" class="text-center">No hay compras registradas</td>
              </tr>
              <tr v-else v-for="compra in comprasCliente" :key="compra.id">
                <td>{{ formatDate(compra.fecha) }}</td>
                <td>{{ compra.total }} Bs</td>
                <td>{{ compra.metodoPago }}</td>
                <td>
                  <button 
                    @click="reimprimirFactura(compra)"
                    class="btn-action"
                  >
                    Reimprimir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'Clientes',
  setup() {
    const clientes = ref([])
    const busqueda = ref('')
    const loading = ref(true)
    const mostrarModalNuevo = ref(false)
    const mostrarHistorial = ref(false)
    const clienteEditar = ref(null)
    const clienteSeleccionado = ref(null)
    const comprasCliente = ref([])

    const clienteForm = ref({
      nombre: '',
      ciNit: '',
      telefono: '',
      direccion: ''
    })

    const clientesFiltrados = computed(() => {
      return clientes.value.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        cliente.ciNit.includes(busqueda.value) ||
        cliente.telefono.includes(busqueda.value)
      )
    })

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
        cerrarModal()
        alert(clienteEditar.value ? 'Cliente actualizado con éxito' : 'Cliente guardado con éxito')
      } catch (error) {
        console.error('Error al guardar cliente:', error)
        alert('Error al guardar el cliente')
      }
    }

    const editarCliente = (cliente) => {
      clienteEditar.value = cliente
      clienteForm.value = { ...cliente }
    }

    const verHistorial = async (cliente) => {
      clienteSeleccionado.value = cliente
      mostrarHistorial.value = true
      
      try {
        const ventasQuery = query(
          collection(db, 'ventas'),
          where('ciNitCliente', '==', cliente.ciNit),
          orderBy('fecha', 'desc')
        )
        
        const querySnapshot = await getDocs(ventasQuery)
        comprasCliente.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha?.toDate()
        }))
      } catch (error) {
        console.error('Error al cargar historial:', error)
        alert('Error al cargar el historial de compras')
      }
    }

    const reimprimirFactura = (venta) => {
      // Aquí implementaremos la reimpresión de facturas
      alert('Funcionalidad de reimpresión en desarrollo')
    }

    const cerrarModal = () => {
      mostrarModalNuevo.value = false
      clienteEditar.value = null
      clienteForm.value = {
        nombre: '',
        ciNit: '',
        telefono: '',
        direccion: ''
      }
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }

    onMounted(cargarClientes)

    return {
      clientes,
      busqueda,
      loading,
      mostrarModalNuevo,
      mostrarHistorial,
      clienteEditar,
      clienteSeleccionado,
      clienteForm,
      comprasCliente,
      clientesFiltrados,
      guardarCliente,
      editarCliente,
      verHistorial,
      reimprimirFactura,
      cerrarModal,
      formatDate
    }
  }
}
</script>

<style scoped>
.clientes {
  padding: 20px;
}

.page-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.content-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
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
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #4a69bd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
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
  color: #2c3e50;
}

.btn-action {
  padding: 4px 8px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: white;
  background-color: #4a69bd;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
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

.cliente-info {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.cliente-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.cliente-info p {
  margin: 5px 0;
  color: #666;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .clientes {
    padding: 10px;
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
}
</style>
