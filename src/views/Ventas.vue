<template>
  <div class="ventas-container">
    <div class="productos-section">
      <h2>Productos Disponibles</h2>
      <input 
        v-model="busqueda" 
        placeholder="Buscar producto..."
        class="search-input"
      >
      <div class="productos-list">
        <div v-for="producto in productosFiltrados" :key="producto.id" class="producto-item">
          <div class="producto-info">
            {{ producto.nombre }} - {{ producto.precioVenta }} Bs
            <div class="cantidad-container">
              <input 
                type="number" 
                v-model.number="cantidades[producto.id]" 
                min="1" 
                :max="producto.cantidad"
                class="cantidad-input"
              >
              <button 
                @click="agregarAlCarrito(producto)"
                class="btn-agregar"
                :disabled="!cantidades[producto.id] || cantidades[producto.id] <= 0"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="carrito-section">
      <h2>Carrito de Compras</h2>
      <div class="carrito-items">
        <div v-for="item in carrito" :key="item.id" class="carrito-item">
          <span>{{ item.nombre }} - {{ item.precioVenta }} Bs x {{ item.cantidad }}</span>
          <button @click="removerDelCarrito(item.id)" class="btn-remover">X</button>
        </div>
      </div>
      <div class="carrito-total">
        <p>Total: {{ totalCarrito }} Bs</p>
        <div class="carrito-actions">
          <select v-model="metodoPago" class="metodo-pago">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="qr">QR</option>
          </select>
          <button 
            @click="iniciarVenta" 
            :disabled="carrito.length === 0"
            class="btn-realizar-venta"
          >
            Realizar Venta
          </button>
        </div>
      </div>
    </div>

    <div class="ventas-dia-section">
      <h2>Ventas del día</h2>
      <div class="ventas-list">
        <div v-for="venta in ventasDelDia" :key="venta.id" class="venta-item">
          <span>{{ venta.fecha.toLocaleTimeString() }} - Total: {{ venta.total }} Bs</span>
          <div class="venta-actions">
            <button @click="anularVenta(venta.id)" class="btn-anular">Anular</button>
            <button @click="reimprimirVenta(venta)" class="btn-reimprimir">Reimprimir</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cliente -->
    <div v-if="mostrarModalCliente" class="modal">
      <div class="modal-content">
        <h3>Datos del Cliente</h3>
        <form @submit.prevent="confirmarVenta" class="form-cliente">
          <div class="form-group">
            <label>Nombre Completo:</label>
            <input v-model="clienteData.nombre" required>
          </div>
          <div class="form-group">
            <label>Teléfono:</label>
            <input v-model="clienteData.telefono" required>
          </div>
          <div class="form-group">
            <label>Dirección:</label>
            <input v-model="clienteData.direccion" required>
          </div>
          <div class="form-group">
            <label>Referencia:</label>
            <input v-model="clienteData.referencia">
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-confirmar">Confirmar Venta</button>
            <button type="button" @click="cancelarVenta" class="btn-cancelar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'
import { Timestamp } from 'firebase/firestore'
import jsPDF from 'jspdf'

export default {
  name: 'Ventas',
  setup() {
    const productosStore = useProductosStore()
    const ventasStore = useVentasStore()
    const busqueda = ref('')
    const metodoPago = ref('efectivo')
    const mostrarModalCliente = ref(false)
    const cantidades = ref({})
    const clienteData = ref({
      nombre: '',
      telefono: '',
      direccion: '',
      referencia: ''
    })

    const productosFiltrados = computed(() => {
      return productosStore.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
      )
    })

    const carrito = computed(() => ventasStore.carrito)
    const totalCarrito = computed(() => ventasStore.totalCarrito)
    const ventasDelDia = computed(() => ventasStore.ventas)

    onMounted(async () => {
      await productosStore.fetchProductos()
      await ventasStore.fetchVentas()
    })

    const agregarAlCarrito = (producto) => {
      const cantidad = cantidades.value[producto.id]
      if (cantidad && cantidad > 0 && cantidad <= producto.cantidad) {
        ventasStore.agregarAlCarrito(producto, cantidad)
        cantidades.value[producto.id] = 0
      }
    }

    const removerDelCarrito = (productoId) => {
      ventasStore.removerDelCarrito(productoId)
    }

    const iniciarVenta = () => {
      mostrarModalCliente.value = true
    }

    const confirmarVenta = async () => {
      try {
        console.log('Iniciando venta...')
        const ventaRealizada = await ventasStore.realizarVenta({
          metodoPago: metodoPago.value,
          cliente: clienteData.value,
          fecha: new Date()
        })
        console.log('Venta realizada:', ventaRealizada)
        alert('Venta realizada con éxito')
        console.log('Generando PDF...')
        generarPDF(ventaRealizada)
        console.log('PDF generado')
        limpiarDespuesDeVenta()
      } catch (error) {
        console.error('Error al realizar la venta:', error)
        alert('Error al realizar la venta: ' + error.message)
      }
    }

    const cancelarVenta = () => {
      mostrarModalCliente.value = false
      clienteData.value = {
        nombre: '',
        telefono: '',
        direccion: '',
        referencia: ''
      }
    }

    const limpiarDespuesDeVenta = () => {
      mostrarModalCliente.value = false
      clienteData.value = {
        nombre: '',
        telefono: '',
        direccion: '',
        referencia: ''
      }
      ventasStore.limpiarCarrito()
      cantidades.value = {}
    }

    const generarPDF = (venta) => {
      console.log('Iniciando generación de PDF...', venta)
      const doc = new jsPDF()
      
      // Convertir la fecha de Firestore a Date si es necesario
      const fecha = venta.fecha instanceof Timestamp ? 
        venta.fecha.toDate() : 
        new Date(venta.fecha)
      
      // Información de la empresa
      doc.setFontSize(18)
      doc.text('DUOCONS SRL', 10, 20)
      doc.setFontSize(10)
      doc.text('Teléfono: 63599920 - 63605479', 10, 30)
      
      // Información del documento
      doc.text(`PROFORMA NRO: ${venta.id}`, 120, 20)
      doc.text(`Fecha de Emisión: ${fecha.toLocaleDateString()}`, 120, 30)
      
      // Información del cliente
      doc.text('CLIENTE:', 10, 45)
      doc.text(`${venta.cliente.nombre}`, 50, 45)
      doc.text('DIRECCIÓN:', 10, 55)
      doc.text(`${venta.cliente.direccion}`, 50, 55)
      doc.text('REFERENCIA:', 10, 65)
      doc.text(`${venta.cliente.referencia || 'N/A'}`, 50, 65)
      
      // Tabla de productos
      let y = 80
      doc.text('Código', 10, y)
      doc.text('Cantidad', 40, y)
      doc.text('Costo', 70, y)
      doc.text('Unidad', 90, y)
      doc.text('Subtotal', 110, y)
      doc.text('Descripción', 140, y)
      
      y += 10
      venta.productos.forEach((item) => {
        doc.text(item.id.toString(), 10, y)
        doc.text(item.cantidad.toString(), 40, y)
        doc.text(item.precioVenta.toString(), 70, y)
        doc.text('MTR2.', 90, y)
        doc.text((item.cantidad * item.precioVenta).toString(), 110, y)
        doc.text(item.nombre, 140, y)
        y += 10
      })
      
      // Totales
      y += 10
      doc.text('TOTAL SIN DESCUENTO:', 100, y)
      doc.text(`${venta.total} Bs.`, 150, y)
      
      // Pie de página
      doc.text('Visita nuestra Plataforma: webcons.com', 10, 280)
      doc.text('Avenida/Roque Aguilera Frente a los cerenguos/ Zona Alto San Pedro', 10, 290)
      
      console.log('PDF generado, abriendo en nueva pestaña...')
      // Abrir el PDF en una nueva pestaña
      window.open(URL.createObjectURL(doc.output('blob')), '_blank')
    }

    const anularVenta = async (ventaId) => {
      if (confirm('¿Estás seguro de que deseas anular esta venta?')) {
        try {
          await ventasStore.anularVenta(ventaId)
          alert('Venta anulada con éxito')
        } catch (error) {
          console.error('Error al anular la venta:', error)
          alert('Error al anular la venta')
        }
      }
    }

    const reimprimirVenta = (venta) => {
      generarPDF(venta)
    }

    return {
      busqueda,
      productosFiltrados,
      carrito,
      totalCarrito,
      ventasDelDia,
      metodoPago,
      mostrarModalCliente,
      cantidades,
      clienteData,
      agregarAlCarrito,
      removerDelCarrito,
      iniciarVenta,
      confirmarVenta,
      cancelarVenta,
      anularVenta,
      reimprimirVenta
    }
  }
}
</script>

<style scoped>
.ventas-container {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.productos-section, .carrito-section, .ventas-dia-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.producto-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.cantidad-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.cantidad-input {
  width: 60px;
  padding: 4px;
}

.btn-agregar {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-agregar:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.carrito-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.btn-remover {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.carrito-total {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #eee;
}

.carrito-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.metodo-pago {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.btn-realizar-venta {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-confirmar {
  background-color: #4CAF50;
  color: white;
}

.btn-cancelar {
  background-color: #ff4444;
  color: white;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
