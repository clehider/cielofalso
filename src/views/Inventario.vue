<template>
  <div>
    <h1>Inventario</h1>
    <input v-model="busqueda" placeholder="Buscar producto...">
    <button @click="mostrarFormulario = true">Agregar Producto</button>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cantidad</th>
          <th>Precio Costo</th>
          <th>Precio Venta</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productosFiltrados" :key="producto.id">
          <td>{{ producto.nombre }}</td>
          <td>{{ producto.cantidad }}</td>
          <td>{{ producto.precioCosto }} Bs</td>
          <td>{{ producto.precioVenta }} Bs</td>
          <td>
            <button @click="editarProducto(producto)">Editar</button>
            <button @click="eliminarProducto(producto.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="mostrarFormulario">
      <h2>{{ modoEdicion ? 'Editar' : 'Agregar' }} Producto</h2>
      <form @submit.prevent="guardarProducto">
        <input v-model="productoActual.nombre" placeholder="Nombre" required>
        <input v-model.number="productoActual.cantidad" type="number" placeholder="Cantidad" required>
        <input v-model.number="productoActual.precioCosto" type="number" placeholder="Precio Costo" required>
        <input v-model.number="productoActual.precioVenta" type="number" placeholder="Precio Venta" required>
        <input v-model.number="productoActual.stockMinimo" type="number" placeholder="Stock Mínimo" required>
        <button type="submit">Guardar</button>
        <button @click="cancelarEdicion">Cancelar</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '../stores/productos'

export default {
  name: 'Inventario',
  setup() {
    const productosStore = useProductosStore()
    const busqueda = ref('')
    const mostrarFormulario = ref(false)
    const modoEdicion = ref(false)
    const productoActual = ref({
      nombre: '',
      cantidad: 0,
      precioCosto: 0,
      precioVenta: 0,
      stockMinimo: 0
    })

    const productosFiltrados = computed(() => {
      return productosStore.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
      )
    })

    onMounted(() => {
      productosStore.fetchProductos()
    })

    const editarProducto = (producto) => {
      productoActual.value = {...producto}
      modoEdicion.value = true
      mostrarFormulario.value = true
    }

    const eliminarProducto = async (id) => {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        await productosStore.deleteProducto(id)
      }
    }

    const guardarProducto = async () => {
      if (modoEdicion.value) {
        await productosStore.updateProducto(productoActual.value.id, productoActual.value)
      } else {
        await productosStore.addProducto(productoActual.value)
      }
      mostrarFormulario.value = false
      modoEdicion.value = false
      productoActual.value = {
        nombre: '',
        cantidad: 0,
        precioCosto: 0,
        precioVenta: 0,
        stockMinimo: 0
      }
    }

    const cancelarEdicion = () => {
      mostrarFormulario.value = false
      modoEdicion.value = false
      productoActual.value = {
        nombre: '',
        cantidad: 0,
        precioCosto: 0,
        precioVenta: 0,
        stockMinimo: 0
      }
    }

    return {
      busqueda,
      productosFiltrados,
      mostrarFormulario,
      modoEdicion,
      productoActual,
      editarProducto,
      eliminarProducto,
      guardarProducto,
      cancelarEdicion
    }
  }
}
</script>
