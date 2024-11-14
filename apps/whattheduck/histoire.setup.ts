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
import '~/theme/variables.scss';
import '~/theme/global.scss';

import { defineSetupVue3 } from '@histoire/plugin-vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import { SocketClient } from '~socket.io-client-services/index';
import { i18n } from '~web';

import router from './src/router';

import en from '~translations/en.json';
import sv from '~translations/sv.json';

export const setupVue3 = defineSetupVue3(({ app }) => {
  app
    .use(IonicVue)
    .use(router)
    .use(createPinia())
    .use(i18n('fr', 'fr', { en, sv }).instance)
    .provide('dmSocket', new SocketClient(import.meta.env.VITE_DM_SOCKET_URL));
});
