<template>
  <div class="crm">
    <h1 class="page-title">Gestión de Clientes</h1>
    
    <div class="content-box">
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

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!clientes.length">
              <td colspan="5" class="empty-message">No hay clientes registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'CRM',
  setup() {
    const busqueda = ref('')
    const clientes = ref([])
    const mostrarModalNuevo = ref(false)

    return {
      busqueda,
      clientes,
      mostrarModalNuevo
    }
  }
}
</script>

<style scoped>
.crm {
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

.empty-message {
  text-align: center;
  color: #666;
  padding: 20px;
}

@media (max-width: 768px) {
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
