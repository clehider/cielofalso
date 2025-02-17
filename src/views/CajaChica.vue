<template>
  <div class="caja-chica-container">
    <h2>Gestión de Caja Chica</h2>

    <div v-if="cajaChicaStore.loading" class="loading">
      Cargando...
    </div>

    <div v-else-if="cajaChicaStore.error" class="error">
      {{ cajaChicaStore.error }}
      <button @click="recargarTransacciones">Reintentar</button>
    </div>

    <div v-else>
      <!-- Balance Section -->
      <div class="balance-section">
        <div class="balance-card">
          <h3>Balance General</h3>
          <div class="balance-info">
            <div class="balance-item">
              <span>Total Ingresos:</span>
              <span class="monto ingreso">{{ totalIngresos }} Bs</span>
            </div>
            <div class="balance-item">
              <span>Total Gastos:</span>
              <span class="monto gasto">{{ totalGastos }} Bs</span>
            </div>
            <div class="balance-item total">
              <span>Balance:</span>
              <span class="monto" :class="{ 'positivo': balance >= 0, 'negativo': balance < 0 }">
                {{ balance }} Bs
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <h3>{{ editando ? 'Editar Transacción' : 'Nueva Transacción' }}</h3>
        <form @submit.prevent="guardarTransaccion" class="transaccion-form">
          <div class="form-group">
            <label>Descripción:</label>
            <input v-model="transaccionForm.descripcion" required>
          </div>
          <div class="form-group">
            <label>Monto:</label>
            <input type="number" v-model.number="transaccionForm.monto" required min="0">
          </div>
          <div class="form-group">
            <label>Tipo:</label>
            <select v-model="transaccionForm.tipo" required>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fecha:</label>
            <input type="date" v-model="transaccionForm.fecha" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              {{ editando ? 'Actualizar' : 'Agregar' }}
            </button>
            <button type="button" @click="limpiarFormulario" class="btn-secundario">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Transactions List -->
      <div class="transacciones-list">
        <h3>Registro de Transacciones</h3>
        <div class="table-container">
          <table v-if="transaccionesFiltradas.length > 0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaccion in transaccionesFiltradas" 
                  :key="transaccion.id"
                  :class="transaccion.tipo">
                <td>{{ formatearFecha(transaccion.fecha) }}</td>
                <td>{{ transaccion.descripcion }}</td>
                <td>{{ transaccion.monto }} Bs</td>
                <td>{{ transaccion.tipo }}</td>
                <td class="acciones">
                  <button @click="editarTransaccion(transaccion)" class="btn-editar">
                    Editar
                  </button>
                  <button @click="eliminarTransaccion(transaccion.id)" class="btn-eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            No hay transacciones registradas
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useCajaChicaStore } from '../stores/cajaChica'

export default {
  name: 'CajaChica',
  setup() {
    const cajaChicaStore = useCajaChicaStore()
    const filtro = ref('')
    const editando = ref(false)
    const transaccionForm = ref({
      descripcion: '',
      monto: 0,
      tipo: 'ingreso',
      fecha: new Date().toISOString().split('T')[0]
    })

    onMounted(() => {
      cajaChicaStore.cargarTransacciones()
    })

    const transaccionesFiltradas = computed(() => {
      return cajaChicaStore.transacciones.filter(transaccion =>
        transaccion.descripcion.toLowerCase().includes(filtro.value.toLowerCase()) ||
        transaccion.tipo.toLowerCase().includes(filtro.value.toLowerCase())
      )
    })

    const totalIngresos = computed(() => {
      return cajaChicaStore.transacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0)
    })

    const totalGastos = computed(() => {
      return cajaChicaStore.transacciones
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0)
    })

    const balance = computed(() => {
      return totalIngresos.value - totalGastos.value
    })

    const guardarTransaccion = async () => {
      try {
        if (editando.value) {
          await cajaChicaStore.actualizarTransaccion(transaccionForm.value)
        } else {
          await cajaChicaStore.agregarTransaccion(transaccionForm.value)
        }
        limpiarFormulario()
      } catch (error) {
        console.error('Error al guardar transacción:', error)
        alert('Error al guardar la transacción')
      }
    }

    const editarTransaccion = (transaccion) => {
      transaccionForm.value = {
        ...transaccion,
        fecha: new Date(transaccion.fecha).toISOString().split('T')[0]
      }
      editando.value = true
    }

    const eliminarTransaccion = async (id) => {
      if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        try {
          await cajaChicaStore.eliminarTransaccion(id)
        } catch (error) {
          console.error('Error al eliminar transacción:', error)
          alert('Error al eliminar la transacción')
        }
      }
    }

    const limpiarFormulario = () => {
      transaccionForm.value = {
        descripcion: '',
        monto: 0,
        tipo: 'ingreso',
        fecha: new Date().toISOString().split('T')[0]
      }
      editando.value = false
    }

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString()
    }

    const recargarTransacciones = () => {
      cajaChicaStore.cargarTransacciones()
    }

    return {
      cajaChicaStore,
      filtro,
      editando,
      transaccionForm,
      transaccionesFiltradas,
      totalIngresos,
      totalGastos,
      balance,
      guardarTransaccion,
      editarTransaccion,
      eliminarTransaccion,
      limpiarFormulario,
      formatearFecha,
      recargarTransacciones
    }
  }
}
</script>

<style scoped>
.caja-chica-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error {
  color: #dc3545;
}

.balance-section, .form-section, .transacciones-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.balance-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.monto {
  font-weight: bold;
}

.monto.ingreso {
  color: #28a745;
}

.monto.gasto {
  color: #dc3545;
}

.monto.positivo {
  color: #28a745;
}

.monto.negativo {
  color: #dc3545;
}

.transaccion-form {
  display: grid;
  gap: 15px;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tr.ingreso {
  background-color: #d4edda;
}

tr.gasto {
  background-color: #f8d7da;
}

.acciones {
  display: flex;
  gap: 5px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
}

.btn-secundario {
  background-color: #6c757d;
}

.btn-editar {
  background-color: #ffc107;
}

.btn-eliminar {
  background-color: #dc3545;
}

button:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .balance-info {
    grid-template-columns: 1fr;
  }
}
</style>
