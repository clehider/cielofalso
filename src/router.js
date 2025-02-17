import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Inventario from './views/Inventario.vue'
import Ventas from './views/Ventas.vue'
import CajaChica from './views/CajaChica.vue'
import Gastos from './views/Gastos.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/inventario', component: Inventario },
  { path: '/ventas', component: Ventas },
  { path: '/caja-chica', component: CajaChica },
  { path: '/gastos', component: Gastos },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
