<template>
  <div class="ventas">
    <h1 class="page-title">Ventas</h1>
    
    <div class="ventas-container">
      <!-- Panel de Productos -->
      <div class="productos-panel">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar productos..."
          >
        </div>
        
        <div class="productos-grid">
          <div 
            v-for="producto in productosFiltrados" 
            :key="producto.id"
            class="producto-card"
            @click="agregarAlCarrito(producto)"
          >
            <div class="producto-info">
              <h3>{{ producto.nombre }}</h3>
              <p class="precio">{{ producto.precioVenta }} Bs</p>
              <p :class="['stock', producto.cantidad < 10 ? 'stock-bajo' : '']">
                Stock: {{ producto.cantidad }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel del Carrito -->
      <div class="carrito-panel">
        <div class="carrito-items">
          <div 
            v-for="item in carrito" 
            :key="item.id"
            class="carrito-item"
          >
            <div class="item-info">
              <h4>{{ item.nombre }}</h4>
              <p>{{ item.precioVenta }} Bs</p>
            </div>
            <div class="item-actions">
              <button 
                class="btn-cantidad"
                @click="decrementarCantidad(item)"
              >-</button>
              <input
                type="number"
                v-model.number="item.cantidad"
                @change="actualizarCantidad(item)"
                class="cantidad-input"
                min="1"
                :max="item.stockDisponible"
              >
              <button 
                class="btn-cantidad"
                @click="incrementarCantidad(item)"
              >+</button>
              <button 
                class="btn-eliminar"
                @click="eliminarDelCarrito(item)"
              >×</button>
            </div>
          </div>
        </div>

        <div class="carrito-total">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>{{ subtotal }} Bs</span>
          </div>
          <div class="total-line total">
            <span>Total:</span>
            <span>{{ total }} Bs</span>
          </div>
        </div>

        <div class="carrito-acciones">
          <button 
            class="btn-procesar"
            @click="procesarVenta"
            :disabled="!carrito.length"
          >Procesar Venta</button>
          <button 
            class="btn-limpiar"
            @click="limpiarCarrito"
            :disabled="!carrito.length"
          >Limpiar Carrito</button>
          <button 
            class="btn-historial"
            @click="mostrarHistorialVentas"
          >Historial de Ventas</button>
        </div>
      </div>
    </div>

    <!-- Modal de Pago -->
    <div v-if="mostrarModalPago" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmar Venta</h2>
          <button @click="cerrarModalPago">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre del Cliente:</label>
            <input 
              type="text" 
              v-model="nombreCliente"
              placeholder="Ingrese el nombre del cliente"
            >
          </div>
          <div class="form-group">
            <label>CI/NIT:</label>
            <input 
              type="text" 
              v-model="ciNitCliente"
              placeholder="Ingrese CI o NIT"
            >
          </div>
          <div class="form-group">
            <label>Método de Pago:</label>
            <select v-model="metodoPago">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
            </select>
          </div>
          <div v-if="metodoPago === 'efectivo'" class="form-group">
            <label>Monto Recibido:</label>
            <input 
              type="number" 
              v-model.number="montoRecibido"
              min="0"
            >
            <div v-if="cambio > 0" class="cambio">
              Cambio: {{ cambio }} Bs
            </div>
          </div>
          <div class="total-pagar">
            <span>Total a Pagar:</span>
            <span>{{ total }} Bs</span>
          </div>
          <div class="form-actions">
            <button 
              class="btn-procesar"
              @click="confirmarVenta"
              :disabled="!puedeConfirmar"
            >Confirmar</button>
            <button 
              class="btn-limpiar"
              @click="cerrarModalPago"
            >Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Historial -->
    <div v-if="mostrarModalHistorial" class="modal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Historial de Ventas</h2>
          <button @click="cerrarModalHistorial">×</button>
        </div>
        <div class="modal-body">
          <table class="ventas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="venta in ventas" 
                  :key="venta.id"
                  :class="{ 'venta-anulada': venta.anulada }">
                <td>{{ venta.id }}</td>
                <td>{{ venta.nombreCliente }}</td>
                <td>{{ formatDate(venta.fecha) }}</td>
                <td>{{ venta.total }} Bs</td>
                <td>{{ venta.anulada ? 'Anulada' : 'Activa' }}</td>
                <td>
                  <button 
                    class="btn-action"
                    @click="reimprimirPDF(venta)"
                    :disabled="venta.anulada">
                    Reimprimir
                  </button>
                  <button 
                    class="btn-action btn-anular"
                    @click="anularVenta(venta)"
                    :disabled="venta.anulada">
                    Anular
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="reporte-actions">
            <button 
              class="btn-action"
              style="background-color: #28a745;"
              @click="generarReporteVentas">
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, increment } from 'firebase/firestore'
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
    const mostrarModalHistorial = ref(false)
    const metodoPago = ref('efectivo')
    const montoRecibido = ref(0)
    const nombreCliente = ref('')
    const ciNitCliente = ref('')
    const ventas = ref([])

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
        return montoRecibido.value >= total.value && nombreCliente.value && ciNitCliente.value
      }
      return nombreCliente.value && ciNitCliente.value
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

    const actualizarCantidad = (item) => {
      if (isNaN(item.cantidad) || item.cantidad < 1) {
        item.cantidad = 1
      } else if (item.cantidad > item.stockDisponible) {
        item.cantidad = item.stockDisponible
      }
      item.cantidad = Math.floor(item.cantidad)
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
      nombreCliente.value = ''
      ciNitCliente.value = ''
    }

    const generarPDF = (ventaId, venta) => {
      if (!pdfMake) {
        console.error('pdfMake no está disponible');
        return;
      }

      const docDefinition = {
        content: [
          { text: 'PROFORMA', style: 'mainHeader' },
          { text: 'Venta y servicios en construcción en seco', style: 'subHeader' },
          { text: 'Cel: 63605479', style: 'contactInfo' },
          { text: '\n' },
          { text: `Nº de Venta: ${ventaId}`, style: 'subheader' },
          { text: `Fecha: ${new Date().toLocaleString()}`, style: 'subheader' },
          { text: `Cliente: ${venta.nombreCliente}`, style: 'subheader' },
          { text: `CI/NIT: ${venta.ciNitCliente}`, style: 'subheader' },
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
          mainHeader: {
            fontSize: 24,
            bold: true,
            color: '#006400',
            alignment: 'center',
            margin: [0, 0, 0, 5]
          },
          subHeader: {
            fontSize: 14,
            color: '#2E74B5',
            alignment: 'center',
            margin: [0, 0, 0, 5]
          },
          contactInfo: {
            fontSize: 12,
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
          total: total.value,
          nombreCliente: nombreCliente.value,
          ciNitCliente: ciNitCliente.value,
          anulada: false
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

    const mostrarHistorialVentas = async () => {
      try {
        const ventasQuery = query(collection(db, 'ventas'), orderBy('fecha', 'desc'))
        const querySnapshot = await getDocs(ventasQuery)
        ventas.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha?.toDate() // Convertir Timestamp a Date
        }))
        mostrarModalHistorial.value = true
      } catch (error) {
        console.error('Error al cargar el historial de ventas:', error)
        alert('Error al cargar el historial de ventas')
      }
    }

    const cerrarModalHistorial = () => {
      mostrarModalHistorial.value = false
    }

    const formatDate = (date) => {
      if (!(date instanceof Date)) return ''
      return date.toLocaleString()
    }

    const reimprimirPDF = (venta) => {
      generarPDF(venta.id, venta)
    }

    const anularVenta = async (venta) => {
      if (!venta || venta.anulada) return;
      
      if (confirm(`¿Está seguro de que desea anular la venta #${venta.id}?`)) {
        try {
          // 1. Marcar la venta como anulada
          const ventaRef = doc(db, 'ventas', venta.id);
          await updateDoc(ventaRef, { 
            anulada: true,
            fechaAnulacion: serverTimestamp()
          });

          // 2. Devolver el stock a los productos
          for (const item of venta.items) {
            const productoRef = doc(db, 'productos', item.productoId);
            await updateDoc(productoRef, {
              cantidad: increment(item.cantidad)
            });
          }

          // 3. Registrar en caja chica
          await addDoc(collection(db, 'cajaChica'), {
            fecha: serverTimestamp(),
            tipo: 'egreso',
            descripcion: `Anulación de Venta #${venta.id}`,
            monto: venta.total,
            metodoPago: venta.metodoPago
          });

          // 4. Actualizar la lista de ventas
          const ventaIndex = ventas.value.findIndex(v => v.id === venta.id);
          if (ventaIndex !== -1) {
            ventas.value[ventaIndex] = { ...ventas.value[ventaIndex], anulada: true };
          }

          alert('Venta anulada con éxito');
          await cargarProductos(); // Recargar productos para actualizar stock
        } catch (error) {
          console.error('Error al anular la venta:', error);
          alert('Error al anular la venta: ' + error.message);
        }
      }
    };

    const generarReporteVentas = async () => {
      try {
        if (!pdfMake) {
          throw new Error('pdfMake no está disponible');
        }

        const ventasValidas = ventas.value.filter(v => !v.anulada);
        const totalVentas = ventasValidas.reduce((sum, v) => sum + v.total, 0);

        const ventasData = ventasValidas.map(v => ([
          v.id,
          v.nombreCliente || 'N/A',
          formatDate(v.fecha),
          v.metodoPago,
          `${v.total.toFixed(2)} Bs`
        ]));

        const docDefinition = {
          content: [
            {
              text: 'Reporte de Ventas',
              style: 'header',
              margin: [0, 0, 0, 20]
            },
            {
              text: `Fecha de generación: ${new Date().toLocaleString()}`,
              style: 'subheader',
              margin: [0, 0, 0, 20]
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto'],
                body: [
                  [
                    { text: 'ID Venta', style: 'tableHeader' },
                    { text: 'Cliente', style: 'tableHeader' },
                    { text: 'Fecha', style: 'tableHeader' },
                    { text: 'Método de Pago', style: 'tableHeader' },
                    { text: 'Total', style: 'tableHeader' }
                  ],
                  ...ventasData
                ]
              }
            },
            {
              text: `\nTotal de Ventas: ${totalVentas.toFixed(2)} Bs`,
              style: 'total',
              margin: [0, 20, 0, 0]
            }
          ],
          styles: {
            header: {
              fontSize: 22,
              bold: true,
              color: '#006400',
              alignment: 'center'
            },
            subheader: {
              fontSize: 16,
              bold: true,
              color: '#2E74B5'
            },
            tableHeader: {
              bold: true,
              fontSize: 13,
              color: 'white',
              fillColor: '#4472C4',
              alignment: 'center'
            },
            total: {
              fontSize: 18,
              bold: true,
              color: '#2E74B5',
              alignment: 'right'
            }
          },
          defaultStyle: {
            fontSize: 12
          }
        };

        pdfMake.createPdf(docDefinition).download(`reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Error al generar el reporte: ' + error.message);
      }
    };

    onMounted(cargarProductos)

    return {
      productos,
      busqueda,
      carrito,
      mostrarModalPago,
      mostrarModalHistorial,
      metodoPago,
      montoRecibido,
      nombreCliente,
      ciNitCliente,
      ventas,
      productosFiltrados,
      subtotal,
      total,
      cambio,
      puedeConfirmar,
      agregarAlCarrito,
      incrementarCantidad,
      decrementarCantidad,
      actualizarCantidad,
      eliminarDelCarrito,
      limpiarCarrito,
      procesarVenta,
      cerrarModalPago,
      confirmarVenta,
      mostrarHistorialVentas,
      cerrarModalHistorial,
      formatDate,
      reimprimirPDF,
      anularVenta,
      generarReporteVentas
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

.cantidad-input {
  width: 50px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
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

.btn-procesar, .btn-limpiar, .btn-historial {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  color: white;
}

.btn-procesar {
  background: #4CAF50;
}

.btn-limpiar {
  background: #6c757d;
}

.btn-historial {
  background: #17a2b8;
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

.ventas-table {
  width: 100%;
  border-collapse: collapse;
}

.ventas-table th,
.ventas-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.ventas-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.btn-action {
  padding: 5px 10px;
  margin: 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: white;
}

.btn-action:not(:last-child) {
  margin-right: 5px;
}

.btn-anular {
  background-color: #dc3545;
}

.btn-anular:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.reporte-actions {
  margin-top: 20px;
  text-align: right;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.venta-anulada {
  background-color: #ffdddd;
}

@media (max-width: 1024px) {
  .ventas-container {
    grid-template-columns: 1fr;
  }
}
</style>
