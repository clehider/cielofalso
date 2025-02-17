import { defineStore } from 'pinia'
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export const useVentasStore = defineStore('ventas', {
  state: () => ({
    ventas: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchVentas() {
      this.loading = true
      try {
        const q = query(collection(db, 'ventas'), orderBy('fecha', 'desc'))
        const querySnapshot = await getDocs(q)
        this.ventas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }))
      } catch (error) {
        console.error('Error al obtener ventas:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async addVenta(venta) {
      try {
        const ventaConFecha = {
          ...venta,
          fecha: Timestamp.fromDate(new Date())
        }
        const docRef = await addDoc(collection(db, 'ventas'), ventaConFecha)
        this.ventas.unshift({ ...ventaConFecha, id: docRef.id, fecha: new Date() })
      } catch (error) {
        console.error('Error al añadir venta:', error)
        throw error
      }
    }
  }
})
