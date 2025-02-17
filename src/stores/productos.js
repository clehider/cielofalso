import { defineStore } from 'pinia'
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore'
import { db } from '../firebase'

export const useProductosStore = defineStore('productos', {
  state: () => ({
    productos: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchProductos() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        this.productos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error al obtener productos:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async addProducto(producto) {
      try {
        const docRef = await addDoc(collection(db, 'productos'), producto)
        this.productos.push({ ...producto, id: docRef.id })
      } catch (error) {
        console.error('Error al añadir producto:', error)
        throw error
      }
    },
    async updateProducto(id, producto) {
      try {
        await updateDoc(doc(db, 'productos', id), producto)
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) {
          this.productos[index] = { ...producto, id }
        }
      } catch (error) {
        console.error('Error al actualizar producto:', error)
        throw error
      }
    },
    async deleteProducto(id) {
      try {
        await deleteDoc(doc(db, 'productos', id))
        this.productos = this.productos.filter(p => p.id !== id)
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        throw error
      }
    }
  }
})
