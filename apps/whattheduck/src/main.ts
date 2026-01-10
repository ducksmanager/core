import '~group-by';
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Only include the CSS utilities that are actually used */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/flex-utils.css';
/* Theme variables */
import './theme/variables.scss';
import './theme/global.scss';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Drivers, Storage } from '@ionic/storage';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import { SocketClient } from 'socket-call-client';
import VueVirtualScroller from 'vue-virtual-scroller';

import en from '~translations/en.json';
import sv from '~translations/sv.json';
import { i18n } from '~web';

import App from './App.vue';
import router from './router';

CapacitorUpdater.notifyAppReady();

const socketUrl = ['web', 'ios'].includes(Capacitor.getPlatform())
  ? import.meta.env.VITE_DM_SOCKET_URL
  : import.meta.env.VITE_DM_SOCKET_URL_NATIVE || import.meta.env.VITE_DM_SOCKET_URL;
console.log(`Using socket URL ${socketUrl}`);

const store = createPinia();

defineCustomElements(window);

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(store)
  .use(VueVirtualScroller)
  .provide('dmSocket', new SocketClient(socketUrl))
  .provide('storySearchSocket', new SocketClient(import.meta.env.VITE_DM_STORY_SEARCH_SOCKET_URL));

router.isReady().then(async () => {
  if (Capacitor.isNativePlatform() && !import.meta.env.VITE_DM_SOCKET_URL_NATIVE) {
    // Lazy load Sentry only when needed
    const currentBundleVersion = (await CapacitorUpdater.current())?.bundle.version;
    const { init: initSentry, browserTracingIntegration, replayIntegration } = await import('@sentry/capacitor');
    const { init: initSentryVue } = await import('@sentry/vue');

    initSentry(
      {
        dsn: import.meta.env.VITE_SENTRY_DSN,
        app,
        debug: true,
        release: `whattheduck@${currentBundleVersion}`,
        dist: currentBundleVersion,
        integrations: [
          browserTracingIntegration(),
          replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 1.0,
        replaysOnErrorSampleRate: 1.0,
      },
      initSentryVue,
    );
  }

  const locale = (await Device.getLanguageCode()).value;
  app.use(i18n(locale, 'fr', { en, sv }).instance);

  const storage = new Storage({
    driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    name: 'whattheduck',
  });
  await storage.create();
  console.info({ 'storage driver': storage.driver });
  app.provide('storage', storage);
  app.mount('#app');
});
