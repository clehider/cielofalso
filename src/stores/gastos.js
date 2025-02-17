import { defineStore } from 'pinia'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export const useGastosStore = defineStore('gastos', {
  state: () => ({
    gastos: [],
    loading: false,
    error: null
  }),

  actions: {
    async cargarGastos() {
      this.loading = true
      try {
        const q = query(collection(db, 'gastos'), orderBy('fecha', 'desc'))
        const querySnapshot = await getDocs(q)
        this.gastos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate?.() || new Date(doc.data().fecha)
        }))
      } catch (error) {
        console.error('Error al cargar gastos:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async agregarGasto(gasto) {
      try {
        const docRef = await addDoc(collection(db, 'gastos'), {
          ...gasto,
          fecha: new Date(gasto.fecha)
        })
        this.gastos.unshift({
          id: docRef.id,
          ...gasto,
          fecha: new Date(gasto.fecha)
        })
        return docRef.id
      } catch (error) {
        console.error('Error al agregar gasto:', error)
        throw error
      }
    },

    async actualizarGasto(gasto) {
      try {
        const { id, ...gastoSinId } = gasto
        await updateDoc(doc(db, 'gastos', id), {
          ...gastoSinId,
          fecha: new Date(gasto.fecha)
        })
        const index = this.gastos.findIndex(g => g.id === id)
        if (index !== -1) {
          this.gastos[index] = {
            ...gasto,
            fecha: new Date(gasto.fecha)
          }
        }
      } catch (error) {
        console.error('Error al actualizar gasto:', error)
        throw error
      }
    },

    async eliminarGasto(id) {
      try {
        await deleteDoc(doc(db, 'gastos', id))
        this.gastos = this.gastos.filter(g => g.id !== id)
      } catch (error) {
        console.error('Error al eliminar gasto:', error)
        throw error
      }
    }
  }
})
