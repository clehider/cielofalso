import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Inventario from '../views/Inventario.vue'
import Ventas from '../views/Ventas.vue'
import CajaChica from '../views/CajaChica.vue'
import CRM from '../views/CRM.vue'

const routes = [
{
  path: '/',
  name: 'Dashboard',
  component: Dashboard,
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
},
{
  path: '/crm',
  name: 'CRM',
  component: CRM,
  meta: { keepAlive: true }
}
]

const router = createRouter({
history: createWebHistory(),
routes,
scrollBehavior(to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  } else {
    return { top: 0 }
  }
}
})

router.onError((error) => {
console.error('Error de navegación:', error)
})

export default router
