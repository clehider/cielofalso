<template>
  <div class="productos-container">
    <h2>Gestión de Productos</h2>

    <!-- Form Section -->
    <div class="form-section">
      <h3>{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
      <form @submit.prevent="guardarProducto" class="producto-form">
        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="productoForm.nombre" required>
        </div>
        <div class="form-group">
          <label>Precio:</label>
          <input type="number" v-model.number="productoForm.precio" required min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Stock:</label>
          <input type="number" v-model.number="productoForm.stock" required min="0">
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

    <div v-if="productosStore.loading" class="loading">
      Cargando...
    </div>

    <div v-else-if="productosStore.error" class="error">
      {{ productosStore.error }}
      <button @click="recargarProductos">Reintentar</button>
    </div>

    <div v-else>
      <!-- Productos List -->
      <div class="productos-list">
        <h3>Lista de Productos</h3>
        <div class="table-container">
          <table v-if="productosStore.productos.length > 0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="producto in productosStore.productos" :key="producto.id">
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.precio }} Bs</td>
                <td>{{ producto.stock }}</td>
                <td class="acciones">
                  <button @click="editarProducto(producto)" class="btn-editar">
                    Editar
                  </button>
                  <button @click="eliminarProducto(producto.id)" class="btn-eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            No hay productos registrados
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useProductosStore } from '../stores/productos'

export default {
  name: 'Productos',
  setup() {
    const productosStore = useProductosStore()
    const editando = ref(false)
    const productoForm = ref({
      nombre: '',
      precio: 0,
      stock: 0
    })

    onMounted(() => {
      productosStore.cargarProductos()
    })

    const guardarProducto = async () => {
      try {
        if (editando.value) {
          await productosStore.actualizarProducto(productoForm.value)
        } else {
          await productosStore.agregarProducto(productoForm.value)
        }
        limpiarFormulario()
      } catch (error) {
        console.error('Error al guardar producto:', error)
        alert('Error al guardar el producto')
      }
    }

    const editarProducto = (producto) => {
      productoForm.value = { ...producto }
      editando.value = true
    }

    const eliminarProducto = async (id) => {
      if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        try {
          await productosStore.eliminarProducto(id)
        } catch (error) {
          console.error('Error al eliminar producto:', error)
          alert('Error al eliminar el producto')
        }
      }
    }

    const limpiarFormulario = () => {
      productoForm.value = {
        nombre: '',
        precio: 0,
        stock: 0
      }
      editando.value = false
    }

    const recargarProductos = () => {
      productosStore.cargarProductos()
    }

    return {
      productosStore,
      editando,
      productoForm,
      guardarProducto,
      editarProducto,
      eliminarProducto,
      limpiarFormulario,
      recargarProductos
    }
  }
}
</script>

<style scoped>
/* ... (mantén los estilos existentes) ... */
</style>
