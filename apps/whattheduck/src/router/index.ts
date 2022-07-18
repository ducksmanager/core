import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/collection'
  },
  {
    path: '/about',
    component: () => import ('../views/About.vue')
  },
  {
    path: '/collection',
    component: () => import ('../views/Collection.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
