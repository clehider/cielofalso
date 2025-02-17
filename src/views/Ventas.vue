<template>
  <div class="ventas">
    <h2 class="page-title">Punto de Venta</h2>

    <div class="ventas-container">
      <!-- Panel de Productos -->
      <div class="productos-panel">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar producto..."
            @input="filtrarProductos"
          >
        </div>

        <div class="productos-grid">
          <div v-for="producto in productosFiltrados" 
               :key="producto.id" 
               class="producto-card"
               @click="agregarAlCarrito(producto)">
            <div class="producto-info">
              <h3>{{ producto.nombre }}</h3>
              <p class="precio">{{ producto.precioVenta }} Bs</p>
              <p class="stock" :class="{ 'stock-bajo': producto.cantidad <= producto.stockMinimo }">
                Stock: {{ producto.cantidad }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel del Carrito -->
      <div class="carrito-panel">
        <h3>Carrito de Compras</h3>
        
        <div class="carrito-items">
          <div v-for="item in carrito" 
               :key="item.id" 
               class="carrito-item">
            <div class="item-info">
              <h4>{{ item.nombre }}</h4>
              <p>{{ item.precioVenta }} Bs x {{ item.cantidad }}</p>
            </div>
            <div class="item-actions">
              <button @click="decrementarCantidad(item)" class="btn-cantidad">-</button>
              <span>{{ item.cantidad }}</span>
              <button @click="incrementarCantidad(item)" class="btn-cantidad">+</button>
              <button @click="eliminarDelCarrito(item)" class="btn-eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="carrito-total">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>{{ subtotal }} Bs</span>
          </div>
          <div class="total-line">
            <span>Total:</span>
            <span class="total">{{ total }} Bs</span>
          </div>
        </div>

        <div class="carrito-acciones">
          <button @click="procesarVenta" 
                  class="btn-procesar" 
                  :disabled="carrito.length === 0">
            Procesar Venta
          </button>
          <button @click="limpiarCarrito" 
                  class="btn-limpiar"
                  :disabled="carrito.length === 0">
            Limpiar Carrito
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Pago -->
    <div class="modal" v-if="mostrarModalPago">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Procesar Pago</h3>
          <button class="btn-close" @click="cerrarModalPago">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Método de Pago:</label>
            <select v-model="metodoPago">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
            </select>
          </div>
          
          <div class="form-group" v-if="metodoPago === 'efectivo'">
            <label>Monto Recibido:</label>
            <input 
              type="number" 
              v-model.number="montoRecibido"
              min="0"
              step="0.01"
            >
            <p class="cambio" v-if="cambio > 0">
              Cambio a devolver: {{ cambio }} Bs
            </p>
          </div>

          <div class="total-pagar">
            <span>Total a Pagar:</span>
            <span>{{ total }} Bs</span>
          </div>

          <div class="form-actions">
            <button @click="confirmarVenta" 
                    class="btn-primary"
                    :disabled="!puedeConfirmar">
              Confirmar Venta
            </button>
            <button @click="cerrarModalPago" 
                    class="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Importamos pdfMake de manera dinámica para evitar problemas de SSR
let pdfMake;
if (typeof window !== 'undefined') {
  import('pdfmake/build/pdfmake').then((pdfMakeModule) => {
    pdfMake = pdfMakeModule.default;
    import('pdfmake/build/vfs_fonts').then((vfsFontsModule) => {
      pdfMake.vfs = vfsFontsModule.default.pdfMake.vfs;
    });
  });
}

export default {
  name: 'Ventas',
  setup() {
    const productos = ref([])
    const busqueda = ref('')
    const carrito = ref([])
    const mostrarModalPago = ref(false)
    const metodoPago = ref('efectivo')
    const montoRecibido = ref(0)

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

    const productosFiltrados = computed(() => {
      return productos.value.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) &&
        producto.cantidad > 0
      )
    })

    const subtotal = computed(() => {
      return carrito.value.reduce((sum, item) => 
        sum + (item.precioVenta * item.cantidad), 0
      )
    })

    const total = computed(() => subtotal.value)

    const cambio = computed(() => {
      if (metodoPago.value !== 'efectivo') return 0
      return Math.max(0, montoRecibido.value - total.value)
    })

    const puedeConfirmar = computed(() => {
      if (metodoPago.value === 'efectivo') {
        return montoRecibido.value >= total.value
      }
      return true
    })

    const agregarAlCarrito = (producto) => {
      const itemExistente = carrito.value.find(item => item.id === producto.id)
      if (itemExistente) {
        if (itemExistente.cantidad < producto.cantidad) {
          itemExistente.cantidad++
        }
      } else {
        carrito.value.push({
          id: producto.id,
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          cantidad: 1,
          stockDisponible: producto.cantidad
        })
      }
    }

    const incrementarCantidad = (item) => {
      if (item.cantidad < item.stockDisponible) {
        item.cantidad++
      }
    }

    const decrementarCantidad = (item) => {
      if (item.cantidad > 1) {
        item.cantidad--
      }
    }

    const eliminarDelCarrito = (item) => {
      carrito.value = carrito.value.filter(i => i.id !== item.id)
    }

    const limpiarCarrito = () => {
      carrito.value = []
      cerrarModalPago()
    }

    const procesarVenta = () => {
      mostrarModalPago.value = true
      montoRecibido.value = total.value
    }

    const cerrarModalPago = () => {
      mostrarModalPago.value = false
      metodoPago.value = 'efectivo'
      montoRecibido.value = 0
    }

    const generarPDF = (ventaId, venta) => {
      if (!pdfMake) {
        console.error('pdfMake no está disponible');
        return;
      }

      const docDefinition = {
        content: [
          { text: 'Factura de Venta', style: 'header' },
          { text: `Nº de Venta: ${ventaId}`, style: 'subheader' },
          { text: `Fecha: ${new Date().toLocaleString()}`, style: 'subheader' },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Producto', style: 'tableHeader' }, 
                  { text: 'Cantidad', style: 'tableHeader' }, 
                  { text: 'Precio Unitario', style: 'tableHeader' }, 
                  { text: 'Subtotal', style: 'tableHeader' }
                ],
                ...venta.items.map(item => [
                  item.nombre,
                  { text: item.cantidad.toString(), alignment: 'center' },
                  { text: `${item.precioUnitario.toFixed(2)} Bs`, alignment: 'right' },
                  { text: `${item.subtotal.toFixed(2)} Bs`, alignment: 'right' }
                ])
              ]
            },
            layout: {
              hLineWidth: function(i, node) {
                return (i === 0 || i === node.table.body.length) ? 2 : 1;
              },
              vLineWidth: function(i, node) {
                return (i === 0 || i === node.table.widths.length) ? 2 : 1;
              },
              hLineColor: function(i, node) {
                return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
              },
              vLineColor: function(i, node) {
                return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
              },
              fillColor: function(rowIndex, node, columnIndex) {
                return (rowIndex === 0) ? '#4472C4' : null;
              },
            }
          },
          { text: '\n' },
          { text: `Total: ${venta.total.toFixed(2)} Bs`, style: 'total' },
          { text: `Método de Pago: ${venta.metodoPago}`, style: 'subheader' },
          { text: '\n\n' },
          { text: '¡Gracias por su compra!', style: 'thanks' }
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            color: '#2E74B5',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 16,
            bold: true,
            color: '#2E74B5',
            margin: [0, 10, 0, 5]
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'white'
          },
          total: {
            fontSize: 18,
            bold: true,
            color: '#2E74B5',
            alignment: 'right'
          },
          thanks: {
            fontSize: 16,
            italic: true,
            color: '#2E74B5',
            alignment: 'center'
          }
        },
        defaultStyle: {
          columnGap: 20,
          fontSize: 12
        }
      };

      pdfMake.createPdf(docDefinition).download(`factura_${ventaId}.pdf`);
    }

    const confirmarVenta = async () => {
      try {
        // Registrar la venta
        const venta = {
          fecha: serverTimestamp(),
          items: carrito.value.map(item => ({
            productoId: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioVenta,
            subtotal: item.cantidad * item.precioVenta
          })),
          metodoPago: metodoPago.value,
          total: total.value
        }

        const docRef = await addDoc(collection(db, 'ventas'), venta)

        // Actualizar stock
        for (const item of carrito.value) {
          const productoRef = doc(db, 'productos', item.id)
          const producto = productos.value.find(p => p.id === item.id)
          await updateDoc(productoRef, {
            cantidad: producto.cantidad - item.cantidad
          })
        }

        // Registrar en caja chica
        await addDoc(collection(db, 'cajaChica'), {
          fecha: serverTimestamp(),
          tipo: 'ingreso',
          descripcion: `Venta #${docRef.id}`,
          monto: total.value,
          metodoPago: metodoPago.value
        })

        // Generar PDF
        generarPDF(docRef.id, venta)

        // Recargar productos y limpiar carrito
        await cargarProductos()
        limpiarCarrito()
        alert('Venta realizada con éxito')
      } catch (error) {
        console.error('Error al procesar la venta:', error)
        alert('Error al procesar la venta')
      }
    }

    onMounted(cargarProductos)

    return {
      productos,
      busqueda,
      carrito,
      mostrarModalPago,
      metodoPago,
      montoRecibido,
      productosFiltrados,
      subtotal,
      total,
      cambio,
      puedeConfirmar,
      agregarAlCarrito,
      incrementarCantidad,
      decrementarCantidad,
      eliminarDelCarrito,
      limpiarCarrito,
      procesarVenta,
      cerrarModalPago,
      confirmarVenta
    }
  }
}
</script>

<style scoped>
.ventas {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.ventas-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.productos-panel, .carrito-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
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

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.producto-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.producto-card:hover {
  transform: translateY(-2px);
}

.producto-info h3 {
  margin: 0 0 10px;
  font-size: 1rem;
}

.precio {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 5px 0;
}

.stock {
  font-size: 0.9rem;
  color: #28a745;
  margin: 0;
}

.stock.stock-bajo {
  color: #dc3545;
}

.carrito-items {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  margin-bottom: 20px;
}

.carrito-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.item-info h4 {
  margin: 0;
  font-size: 1rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cantidad {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-eliminar {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
}

.carrito-total {
  border-top: 2px solid #ddd;
  padding-top: 15px;
  margin-bottom: 20px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.total {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
}

.carrito-acciones {
  display: grid;
  gap: 10px;
}

.btn-procesar {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-limpiar {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
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

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.cambio {
  color: #28a745;
  font-weight: bold;
  margin-top: 5px;
}

.total-pagar {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .ventas-container {
    grid-template-columns: 1fr;
  }
}
</style>
