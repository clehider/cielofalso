import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Inventario from '../views/Inventario.vue'
import Ventas from '../views/Ventas.vue'
import CajaChica from '../views/CajaChica.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { keepAlive: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: Inventario,
    meta: { keepAlive: true }
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: Ventas,
    meta: { keepAlive: true }
  },
  {
    path: '/caja-chica',
    name: 'CajaChica',
    component: CajaChica,
    meta: { keepAlive: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // Asegurarse de que la ruta existe
  if (!to.matched.length) {
    next('/')
    return
  }
  next()
})

export default router
