import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Inventario from '../views/Inventario.vue'
import Ventas from '../views/Ventas.vue'
import CajaChica from '../views/CajaChica.vue'
import Clientes from '../views/Clientes.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: Inventario
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: Ventas
  },
  {
    path: '/caja-chica',
    name: 'CajaChica',
    component: CajaChica
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: Clientes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
