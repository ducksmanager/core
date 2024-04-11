import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import { i18n } from '~web';

import App from './App.vue';
import router from './router';

import en from '~translations/en.json';
import sv from '~translations/sv.json';

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
import { useSocket } from '~socket.io-client-services/index';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

const store = createPinia();

defineCustomElements(window);

const app = createApp(App, {
  setup: () => ({
    t: useI18n().t,
  }),
})
  .use(IonicVue)
  .use(router)
  .use(store)
  .use(i18n('fr', { en, sv }).instance)
  .provide('socket', useSocket(import.meta.env.VITE_DM_SOCKET_URL));

router.isReady().then(async () => {
  app.mount('#app');
});
