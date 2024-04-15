import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import OwnedIssueCopy from '~/components/OwnedIssueCopy.vue';
import AddFromCamera from '~/views/AddFromCamera.vue';
import Authors from '~/views/Authors.vue';
import CountryList from '~/views/CountryList.vue';
import CoverSearchResults from '~/views/CoverSearchResults.vue';
import Forgot from '~/views/Forgot.vue';
import IssueList from '~/views/IssueList.vue';
import Login from '~/views/Login.vue';
import Logout from '~/views/Logout.vue';
import OwnedIssueCopiesModal from '~/views/OwnedIssueCopiesModal.vue';
import PublicationList from '~/views/PublicationList.vue';
import Report from '~/views/Report.vue';
import Search from '~/views/Search.vue';
import Signup from '~/views/Signup.vue';
import Stats from '~/views/Stats.vue';

export type RouteMeta = {
  onOffline?: 'readonly' | 'unavailable';
  onNoToken?: 'logout';
};

const routes: RouteRecordRaw[] = [
  {
    name: 'OwnedIssueCopiesModal',
    path: '/collection/:countrycode/:magazinecode/:issuenumber',
    component: OwnedIssueCopiesModal,
    children: [
      {
        path: 'copy/:copyIndex',
        component: OwnedIssueCopy,
      },
    ],
    meta: {
      onOffline: 'unavailable',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    name: 'IssueList',
    path: '/:type(collection|coa)/:countrycode/:magazinecode',
    component: IssueList,
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    name: 'PublicationList',
    path: '/:type(collection|coa)/:countrycode',
    component: PublicationList,
    meta: {
      onOffline: 'readonly',
      onNoToken: 'logout',
    } as RouteMeta,
  },
  {
    name: 'CountryList',
    path: '/:type(collection|coa)',
    component: CountryList,
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
    path: '/add-from-camera',
    component: AddFromCamera,
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
