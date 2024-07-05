import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteMeta } from 'vue-router';

import Collection from '~/components/Collection.vue';
import Authors from '~/views/Authors.vue';
import CoverSearchResults from '~/views/CoverSearchResults.vue';
import Forgot from '~/views/Forgot.vue';
import Login from '~/views/Login.vue';
import Logout from '~/views/Logout.vue';
import Recent from '~/views/Recent.vue';
import Report from '~/views/Report.vue';
import Search from '~/views/Search.vue';
import Signup from '~/views/Signup.vue';
import Stats from '~/views/Stats.vue';
import Suggestions from '~/views/Suggestions.vue';

const routes = [
  {
    name: 'Collection',
    path: '/:type(collection|coa)',
    component: Collection,
    props: true,
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/search',
    component: Search,
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/cover-search-results',
    component: CoverSearchResults,
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/recent',
    component: Recent,
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/report',
    component: Report,
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/authors',
    component: Authors,
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/stats',
    component: Stats,
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    path: '/signup',
    component: Signup,
    meta: {
      onOffline: 'unavailable',
    } as RouteMeta,
  },
  {
    path: '/forgot',
    component: Forgot,
    meta: {
      onOffline: 'unavailable',
    } as RouteMeta,
  },
  {
    path: '/logout',
    component: Logout,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/suggestions',
    component: Suggestions,
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
