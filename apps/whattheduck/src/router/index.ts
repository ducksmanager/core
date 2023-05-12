import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import OwnedIssueCopy from '../components/OwnedIssueCopy.vue';
import OwnedIssueCopies from '../views/OwnedIssueCopies.vue';

import CountryList from '~/views/CountryList.vue';
import Default from '~/views/Default.vue';
import IssueList from '~/views/IssueList.vue';
import PublicationList from '~/views/PublicationList.vue';
import Search from '~/views/Search.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/collection/:countrycode/:magazinecode/:issuenumber',
    component: () => OwnedIssueCopies,
    children: [
      {
        path: 'copy/:copyIndex',
        component: OwnedIssueCopy,
      },
    ],
  },
  {
    path: '/:type(collection|coa)/:countrycode/:magazinecode',
    component: IssueList,
  },
  {
    path: '/:type(collection|coa)/:countrycode',
    component: PublicationList,
  },
  {
    path: '/:type(collection|coa)',
    component: CountryList,
  },
  {
    path: '/search',
    component: Search,
  },
  {
    path: '/',
    component: Default,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
