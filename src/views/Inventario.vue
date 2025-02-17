<template>
  <div class="inventario">
    <h2 class="page-title">Gestión de Inventario</h2>

    <div class="controls">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="busqueda" 
          placeholder="Buscar producto..."
          @input="filtrarProductos"
        >
      </div>
      <button class="btn-primary" @click="mostrarModalProducto()">
        <i class="fas fa-plus"></i> Agregar Producto
      </button>
    </div>

    <div class="table-container">
      <table v-if="productosFiltrados.length > 0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio Costo</th>
            <th>Precio Venta</th>
            <th>Stock Mínimo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productosFiltrados" :key="producto.id"
              :class="{ 'stock-bajo': producto.cantidad <= producto.stockMinimo }">
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.cantidad }}</td>
            <td>{{ producto.precioCosto }} Bs</td>
            <td>{{ producto.precioVenta }} Bs</td>
            <td>{{ producto.stockMinimo }}</td>
            <td>
              <span class="estado" :class="getEstadoClase(producto)">
                {{ getEstadoTexto(producto) }}
              </span>
            </td>
            <td class="acciones">
              <button class="btn-icon" @click="mostrarModalProducto(producto)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" @click="eliminarProducto(producto.id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        No se encontraron productos
      </div>
    </div>

    <!-- Modal de Producto -->
    <div class="modal" v-if="mostrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ productoEditando ? 'Editar' : 'Nuevo' }} Producto</h3>
          <button class="btn-close" @click="cerrarModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarProducto">
            <div class="form-group">
              <label>Nombre:</label>
              <input 
                type="text" 
                v-model="productoForm.nombre" 
                required
              >
            </div>
            <div class="form-group">
              <label>Cantidad:</label>
              <input 
                type="number" 
                v-model.number="productoForm.cantidad" 
                required
                min="0"
              >
            </div>
            <div class="form-group">
              <label>Precio Costo (Bs):</label>
              <input 
                type="number" 
                v-model.number="productoForm.precioCosto" 
                required
                min="0"
                step="0.01"
              >
            </div>
            <div class="form-group">
              <label>Precio Venta (Bs):</label>
              <input 
                type="number" 
                v-model.number="productoForm.precioVenta" 
                required
                min="0"
                step="0.01"
              >
            </div>
            <div class="form-group">
              <label>Stock Mínimo:</label>
              <input 
                type="number" 
                v-model.number="productoForm.stockMinimo" 
                required
                min="0"
              >
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                {{ productoEditando ? 'Actualizar' : 'Guardar' }}
              </button>
              <button type="button" class="btn-secondary" @click="cerrarModal">
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
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'Inventario',
  setup() {
    const productos = ref([])
    const busqueda = ref('')
    const mostrarModal = ref(false)
    const productoEditando = ref(null)
    const productoForm = ref({
      nombre: '',
      cantidad: 0,
      precioCosto: 0,
      precioVenta: 0,
      stockMinimo: 0
    })

    const productosFiltrados = computed(() => {
      return productos.value.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
      )
    })

    const cargarProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        productos.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error al cargar productos:', error)
        alert('Error al cargar los productos')
      }
    }

    const mostrarModalProducto = (producto = null) => {
      if (producto) {
        productoEditando.value = producto
        productoForm.value = { ...producto }
      } else {
        productoEditando.value = null
        productoForm.value = {
          nombre: '',
          cantidad: 0,
          precioCosto: 0,
          precioVenta: 0,
          stockMinimo: 0
        }
      }
      mostrarModal.value = true
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      productoEditando.value = null
    }

    const guardarProducto = async () => {
      try {
        if (productoEditando.value) {
          const docRef = doc(db, 'productos', productoEditando.value.id)
          await updateDoc(docRef, productoForm.value)
        } else {
          await addDoc(collection(db, 'productos'), productoForm.value)
        }
        await cargarProductos()
        cerrarModal()
      } catch (error) {
        console.error('Error al guardar producto:', error)
        alert('Error al guardar el producto')
      }
    }

    const eliminarProducto = async (id) => {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
          await deleteDoc(doc(db, 'productos', id))
          await cargarProductos()
        } catch (error) {
          console.error('Error al eliminar producto:', error)
          alert('Error al eliminar el producto')
        }
      }
    }

    const getEstadoClase = (producto) => {
      if (producto.cantidad <= 0) return 'agotado'
      if (producto.cantidad <= producto.stockMinimo) return 'bajo'
      return 'normal'
    }

    const getEstadoTexto = (producto) => {
      if (producto.cantidad <= 0) return 'Agotado'
      if (producto.cantidad <= producto.stockMinimo) return 'Stock Bajo'
      return 'Normal'
    }

    onMounted(cargarProductos)

    return {
      productos,
      busqueda,
      mostrarModal,
      productoEditando,
      productoForm,
      productosFiltrados,
      mostrarModalProducto,
      cerrarModal,
      guardarProducto,
      eliminarProducto,
      getEstadoClase,
      getEstadoTexto
    }
  }
}
</script>

<style scoped>
.inventario {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
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

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
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

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.estado {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado.normal {
  background-color: #d4edda;
  color: #155724;
}

.estado.bajo {
  background-color: #fff3cd;
  color: #856404;
}

.estado.agotado {
  background-color: #f8d7da;
  color: #721c24;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-icon:first-child {
  background-color: #ffc107;
}

.btn-icon:last-child {
  background-color: #dc3545;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
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

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
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
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary {
  background-color: #4CAF50;
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

.no-data {
  padding: 20px;
  text-align: center;
  color: #666;
}

tr.stock-bajo {
  background-color: #fff3cd3d;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .table-container {
    margin-top: 10px;
  }

  th, td {
    padding: 8px;
  }
}
</style>
