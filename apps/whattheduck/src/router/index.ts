import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/collection/:countrycode/:magazinecode/:issuenumber',
    component: () => import('../views/OwnedIssueCopies.vue'),
    children: [
      {
        path: 'copy/:copyIndex',
        component: () => import('../components/OwnedIssueCopy.vue'),
      },
    ],
  },
  {
    path: '/collection/:countrycode/:magazinecode',
    component: () => import('../views/IssueList.vue'),
  },
  {
    path: '/collection/:countrycode',
    component: () => import('../views/PublicationList.vue'),
  },
  {
    path: '/collection',
    component: () => import('../views/CountryList.vue'),
  },
  {
    path: '/search',
    component: () => import('../views/Search.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
