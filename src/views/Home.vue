<template>
  <div class="dashboard">
    <h2 class="page-title">Dashboard</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-box"></i>
          <h3>Inventario</h3>
        </div>
        <div class="stat-content">
          <p class="stat-number">{{ totalProductos }}</p>
          <p class="stat-label">Productos en Stock</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-shopping-cart"></i>
          <h3>Ventas</h3>
        </div>
        <div class="stat-content">
          <p class="stat-number">{{ ventasHoy }}</p>
          <p class="stat-label">Ventas del Día</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-cash-register"></i>
          <h3>Caja</h3>
        </div>
        <div class="stat-content">
          <p class="stat-number">{{ balanceCaja }} Bs</p>
          <p class="stat-label">Balance Actual</p>
        </div>
      </div>
    </div>

    <div class="recent-activity">
      <h3>Actividad Reciente</h3>
      <div class="activity-list">
        <div v-for="(actividad, index) in actividades" :key="index" class="activity-item">
          <div class="activity-icon">
            <i :class="actividad.icon"></i>
          </div>
          <div class="activity-details">
            <p class="activity-text">{{ actividad.descripcion }}</p>
            <p class="activity-time">{{ actividad.tiempo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'Home',
  setup() {
    const totalProductos = ref(0)
    const ventasHoy = ref(0)
    const balanceCaja = ref(0)
    const actividades = ref([])

    const cargarEstadisticas = async () => {
      try {
        // Cargar total de productos
        const productosSnapshot = await getDocs(collection(db, 'productos'))
        totalProductos.value = productosSnapshot.size

        // Cargar ventas del día
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const ventasQuery = query(
          collection(db, 'ventas'),
          orderBy('fecha', 'desc')
        )
        const ventasSnapshot = await getDocs(ventasQuery)
        ventasHoy.value = ventasSnapshot.docs.filter(doc => 
          doc.data().fecha.toDate() >= hoy
        ).length

        // Cargar balance de caja
        const cajaQuery = query(
          collection(db, 'cajaChica'),
          orderBy('fecha', 'desc')
        )
        const cajaSnapshot = await getDocs(cajaQuery)
        let ingresos = 0
        let gastos = 0
        cajaSnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.tipo === 'ingreso') {
            ingresos += data.monto
          } else {
            gastos += data.monto
          }
        })
        balanceCaja.value = ingresos - gastos

        // Cargar actividades recientes
        const actividadesRecientes = []
        
        // Últimas ventas
        const ultimasVentas = await getDocs(query(
          collection(db, 'ventas'),
          orderBy('fecha', 'desc'),
          limit(3)
        ))
        
        ultimasVentas.forEach(doc => {
          const venta = doc.data()
          actividadesRecientes.push({
            tipo: 'venta',
            descripcion: `Venta realizada por ${venta.monto} Bs`,
            tiempo: venta.fecha.toDate().toLocaleString(),
            icon: 'fas fa-shopping-cart'
          })
        })

        // Últimos movimientos de caja
        const ultimosMovimientos = await getDocs(query(
          collection(db, 'cajaChica'),
          orderBy('fecha', 'desc'),
          limit(3)
        ))

        ultimosMovimientos.forEach(doc => {
          const movimiento = doc.data()
          actividadesRecientes.push({
            tipo: 'caja',
            descripcion: `${movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} de ${movimiento.monto} Bs - ${movimiento.descripcion}`,
            tiempo: movimiento.fecha.toDate().toLocaleString(),
            icon: movimiento.tipo === 'ingreso' ? 'fas fa-plus-circle' : 'fas fa-minus-circle'
          })
        })

        // Ordenar por fecha
        actividadesRecientes.sort((a, b) => 
          new Date(b.tiempo) - new Date(a.tiempo)
        )

        actividades.value = actividadesRecientes

      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    }

    onMounted(cargarEstadisticas)

    return {
      totalProductos,
      ventasHoy,
      balanceCaja,
      actividades
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-header i {
  font-size: 1.5rem;
  margin-right: 10px;
  color: #4CAF50;
}

.stat-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
}

.stat-label {
  margin: 5px 0 0;
  color: #666;
  font-size: 0.9rem;
}

.recent-activity {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recent-activity h3 {
  margin: 0 0 20px;
  color: #2c3e50;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.activity-icon i {
  color: white;
  font-size: 1.2rem;
}

.activity-details {
  flex: 1;
}

.activity-text {
  margin: 0;
  color: #2c3e50;
}

.activity-time {
  margin: 5px 0 0;
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 15px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
