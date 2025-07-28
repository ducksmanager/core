import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteMeta } from 'vue-router';

const routes = [
  {
    name: 'Collection',
    path: '/collection',
    component: () => import('~/components/Collection.vue'),
    props: true,
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/search',
    component: () => import('~/views/Search.vue'),
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/cover-search-results',
    component: () => import('~/views/CoverSearchResults.vue'),
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/recent',
    component: () => import('~/views/Recent.vue'),
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/report',
    component: () => import('~/views/Report.vue'),
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/authors',
    component: () => import('~/views/Authors.vue'),
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/stats',
    component: () => import('~/views/Stats.vue'),
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/signup',
    component: () => import('~/views/Signup.vue'),
    meta: {
      onOffline: 'unavailable',
    } as RouteMeta,
  },
  {
    path: '/forgot',
    component: () => import('~/views/Forgot.vue'),
    meta: {
      onOffline: 'unavailable',
    } as RouteMeta,
  },
  {
    path: '/logout',
    component: () => import('~/views/Logout.vue'),
    onOffline: 'unavailable',
  },
  {
    path: '/login',
    component: () => import('~/views/Login.vue'),
  },
  {
    path: '/suggestions',
    component: () => import('~/views/Suggestions.vue'),
  },
  {
    path: '/settings',
    component: () => import('~/views/Settings.vue'),
  },
  {
    path: '/test',
    component: () => import('~/views/Test.vue'),
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
