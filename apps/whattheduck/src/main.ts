import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { useI18n } from 'vue-i18n';

import App from './App.vue';
import i18n from './i18n';
import router from './router';

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
import './theme/variables.css';

const store = createPinia();
const app = createApp(App, {
  setup() {
    const { t } = useI18n(); // call `useI18n`, and spread `t` from  `useI18n` returning
    return { t }; // return render context that included `t`
  },
})
  .use(IonicVue)
  .use(router)
  .use(store)
  .use(i18n);

router.isReady().then(() => {
  app.mount('#app');
});
