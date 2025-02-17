import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Productos from '../views/Productos.vue'
import Ventas from '../views/Ventas.vue'
import CajaChica from '../views/CajaChica.vue'
import Gastos from '../views/Gastos.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/productos',
    name: 'Productos',
    component: Productos
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
    path: '/gastos',
    name: 'Gastos',
    component: Gastos
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
