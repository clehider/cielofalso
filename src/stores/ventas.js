import { defineStore } from 'pinia'
import { useProductosStore } from './productos'
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export const useVentasStore = defineStore('ventas', {
  state: () => ({
    ventas: [],
    carrito: []
  }),
  getters: {
    totalCarrito: (state) => {
      return state.carrito.reduce((total, item) => total + item.precioVenta * item.cantidad, 0)
    }
  },
  actions: {
    agregarAlCarrito(producto, cantidad) {
      const itemExistente = this.carrito.find(item => item.id === producto.id)
      if (itemExistente) {
        itemExistente.cantidad += cantidad
      } else {
        this.carrito.push({ ...producto, cantidad })
      }
    },
    removerDelCarrito(productoId) {
      const index = this.carrito.findIndex(item => item.id === productoId)
      if (index !== -1) {
        this.carrito.splice(index, 1)
      }
    },
    limpiarCarrito() {
      this.carrito = []
    },
    async realizarVenta(ventaData) {
      const productosStore = useProductosStore()
      const ventaRef = collection(db, 'ventas')
      const nuevaVenta = {
        ...ventaData,
        productos: this.carrito,
        total: this.totalCarrito,
        fecha: Timestamp.fromDate(new Date())
      }

      try {
        const docRef = await addDoc(ventaRef, nuevaVenta)
        this.ventas.push({ id: docRef.id, ...nuevaVenta })

        // Actualizar el stock de los productos
        for (const item of this.carrito) {
          await productosStore.actualizarStock(item.id, -item.cantidad)
        }

        this.limpiarCarrito()
        return { id: docRef.id, ...nuevaVenta }
      } catch (error) {
        console.error('Error al realizar la venta:', error)
        throw error
      }
    },
    async fetchVentas() {
      const ventasRef = collection(db, 'ventas')
      try {
        const querySnapshot = await getDocs(ventasRef)
        this.ventas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }))
      } catch (error) {
        console.error('Error al obtener las ventas:', error)
      }
    },
    async anularVenta(ventaId) {
      const productosStore = useProductosStore()
      const ventaRef = doc(db, 'ventas', ventaId)
      try {
        // Obtener la venta antes de eliminarla
        const ventaQuery = query(collection(db, 'ventas'), where('__name__', '==', ventaId))
        const ventaSnapshot = await getDocs(ventaQuery)
        if (!ventaSnapshot.empty) {
          const ventaData = ventaSnapshot.docs[0].data()
          
          // Restaurar el stock de los productos
          for (const item of ventaData.productos) {
            await productosStore.actualizarStock(item.id, item.cantidad)
          }
        }

        // Eliminar la venta
        await deleteDoc(ventaRef)
        const index = this.ventas.findIndex(v => v.id === ventaId)
        if (index !== -1) {
          this.ventas.splice(index, 1)
        }
      } catch (error) {
        console.error('Error al anular la venta:', error)
        throw error
      }
    }
  }
})
