import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/producto/:id',
      name: 'product',
      component: () => import('../views/ProductView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue')
    },
    {
      path: '/tiendas',
      name: 'tiendas',
      component: () => import('../views/TiendasView.vue')
    },
    {
      path: '/tienda/:name',
      name: 'artistStore',
      component: () => import('../views/ArtistStoreView.vue')
    },
    {
      path: '/nosotros',
      name: 'nosotros',
      component: () => import('../views/NosotrosView.vue')
    },
    {
      path: '/rastreo',
      name: 'rastreo',
      component: () => import('../views/RastreoView.vue')
    },
    {
      path: '/contacto',
      name: 'contacto',
      component: () => import('../views/ContactoView.vue')
    },
    {
      path: '/facturacion',
      name: 'facturacion',
      component: () => import('../views/FacturacionView.vue')
    },
    {
      path: '/pago-resultado',
      name: 'pago-resultado',
      component: () => import('../views/PagoResultadoView.vue')
    },
    {
      path: '/mantenimiento',
      name: 'mantenimiento',
      component: () => import('../views/MantenimientoView.vue')
    }
  ]
})

export default router
