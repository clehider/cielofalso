import { defineStore } from 'pinia'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export const useCRMStore = defineStore('crm', {
  state: () => ({
    clientes: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchClientes() {
      this.loading = true
      try {
        const q = query(collection(db, 'clientes'), orderBy('fechaRegistro', 'desc'))
        const querySnapshot = await getDocs(q)
        this.clientes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaRegistro: doc.data().fechaRegistro?.toDate(),
          ultimaInteraccion: doc.data().ultimaInteraccion?.toDate()
        }))
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async agregarCliente(cliente) {
      try {
        const docRef = await addDoc(collection(db, 'clientes'), {
          ...cliente,
          fechaRegistro: Timestamp.now(),
          ultimaInteraccion: Timestamp.now()
        })
        await this.fetchClientes()
        return docRef.id
      } catch (error) {
        console.error('Error al agregar cliente:', error)
        throw error
      }
    },

    async actualizarCliente(id, datos) {
      try {
        const clienteRef = doc(db, 'clientes', id)
        await updateDoc(clienteRef, {
          ...datos,
          ultimaInteraccion: Timestamp.now()
        })
        await this.fetchClientes()
      } catch (error) {
        console.error('Error al actualizar cliente:', error)
        throw error
      }
    },

    async eliminarCliente(id) {
      try {
        await deleteDoc(doc(db, 'clientes', id))
        await this.fetchClientes()
      } catch (error) {
        console.error('Error al eliminar cliente:', error)
        throw error
      }
    },

    async agregarInteraccion(clienteId, interaccion) {
      try {
        const clienteRef = doc(db, 'clientes', clienteId)
        const cliente = this.clientes.find(c => c.id === clienteId)
        
        if (!cliente) throw new Error('Cliente no encontrado')

        await updateDoc(clienteRef, {
          interacciones: [...(cliente.interacciones || []), {
            ...interaccion,
            fecha: Timestamp.now(),
            id: Date.now().toString()
          }],
          ultimaInteraccion: Timestamp.now()
        })
        
        await this.fetchClientes()
      } catch (error) {
        console.error('Error al agregar interacción:', error)
        throw error
      }
    }
  }
})
