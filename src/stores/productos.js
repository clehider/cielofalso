import { defineStore } from 'pinia'
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const useProductosStore = defineStore('productos', {
  state: () => ({
    productos: []
  }),
  actions: {
    async fetchProductos() {
      const productosRef = collection(db, 'productos')
      try {
        const querySnapshot = await getDocs(productosRef)
        this.productos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error al obtener productos:', error)
        throw error
      }
    },
    
    async agregarProducto(producto) {
      const productosRef = collection(db, 'productos')
      try {
        const docRef = await addDoc(productosRef, producto)
        this.productos.push({ id: docRef.id, ...producto })
      } catch (error) {
        console.error('Error al agregar producto:', error)
        throw error
      }
    },
    
    async actualizarProducto(id, datos) {
      const productoRef = doc(db, 'productos', id)
      try {
        await updateDoc(productoRef, datos)
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) {
          this.productos[index] = { ...this.productos[index], ...datos }
        }
      } catch (error) {
        console.error('Error al actualizar producto:', error)
        throw error
      }
    },
    
    async eliminarProducto(id) {
      const productoRef = doc(db, 'productos', id)
      try {
        await deleteDoc(productoRef)
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) {
          this.productos.splice(index, 1)
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        throw error
      }
    },
    
    async actualizarStock(productoId, cantidad) {
      try {
        const producto = this.productos.find(p => p.id === productoId)
        if (!producto) {
          throw new Error('Producto no encontrado')
        }
        
        const nuevoStock = producto.cantidad + cantidad
        if (nuevoStock < 0) {
          throw new Error('Stock insuficiente')
        }
        
        const productoRef = doc(db, 'productos', productoId)
        await updateDoc(productoRef, {
          cantidad: nuevoStock
        })
        
        // Actualizar el estado local
        const index = this.productos.findIndex(p => p.id === productoId)
        if (index !== -1) {
          this.productos[index].cantidad = nuevoStock
        }
      } catch (error) {
        console.error('Error al actualizar stock:', error)
        throw error
      }
    }
  }
})
