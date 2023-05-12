import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
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
  {
    path: '/edit-issues',
    component: () => import('../views/OwnedIssueCopies.vue'),

    children: [
      {
        path: 'copy/:copyindex',
        component: () => import('../components/OwnedIssueCopy.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
