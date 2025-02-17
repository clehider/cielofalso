import { defineStore } from 'pinia'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export const useCajaChicaStore = defineStore('cajaChica', {
  state: () => ({
    transacciones: [],
    loading: false,
    error: null
  }),
  actions: {
    async cargarTransacciones() {
      this.loading = true
      try {
        const q = query(collection(db, 'cajaChica'), orderBy('fecha', 'desc'))
        const querySnapshot = await getDocs(q)
        this.transacciones = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }))
      } catch (error) {
        console.error('Error al cargar transacciones:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async agregarTransaccion(transaccion) {
      try {
        const transaccionConFecha = {
          ...transaccion,
          fecha: Timestamp.fromDate(new Date(transaccion.fecha))
        }
        const docRef = await addDoc(collection(db, 'cajaChica'), transaccionConFecha)
        this.transacciones.unshift({
          id: docRef.id,
          ...transaccionConFecha,
          fecha: new Date(transaccion.fecha)
        })
      } catch (error) {
        console.error('Error al agregar transacción:', error)
        throw error
      }
    },
    async actualizarTransaccion(transaccion) {
      try {
        const { id, ...transaccionSinId } = transaccion
        await updateDoc(doc(db, 'cajaChica', id), {
          ...transaccionSinId,
          fecha: Timestamp.fromDate(new Date(transaccion.fecha))
        })
        const index = this.transacciones.findIndex(t => t.id === id)
        if (index !== -1) {
          this.transacciones[index] = {
            ...transaccion,
            fecha: new Date(transaccion.fecha)
          }
        }
      } catch (error) {
        console.error('Error al actualizar transacción:', error)
        throw error
      }
    },
    async eliminarTransaccion(id) {
      try {
        await deleteDoc(doc(db, 'cajaChica', id))
        this.transacciones = this.transacciones.filter(t => t.id !== id)
      } catch (error) {
        console.error('Error al eliminar transacción:', error)
        throw error
      }
    }
  }
})
