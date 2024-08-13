import '~prisma-schemas/util/groupBy';
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
/* Theme variables */
import './theme/variables.scss';
import './theme/global.scss';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Drivers, Storage } from '@ionic/storage';
import { IonicVue } from '@ionic/vue';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { createPinia } from 'pinia';
import VueVirtualScroller from 'vue-virtual-scroller';
import { i18n } from '~web';

import App from './App.vue';
import router from './router';

import en from '~translations/en.json';
import sv from '~translations/sv.json';

CapacitorUpdater.notifyAppReady();

const store = createPinia();

defineCustomElements(window);

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(store)
  .use(i18n('fr', { en, sv }).instance)
  .use(VueVirtualScroller);

router.isReady().then(async () => {
  const storage = new Storage({
    driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage],
    name: 'whattheduck',
  });
  await storage.defineDriver(CordovaSQLiteDriver);
  await storage.create();
  app.provide('storage', storage);
  app.mount('#app');
});
