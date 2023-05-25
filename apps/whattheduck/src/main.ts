import { Capacitor } from '@capacitor/core';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { IonicVue } from '@ionic/vue';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { useI18n } from 'vue-i18n';

import App from './App.vue';
import i18n from './i18n';
import router from './router';

import db from '~/persistence/data-sources/db';

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

customElements.define('jeep-sqlite', JeepSqlite);

const initSqlite = async () => {
  const platform = Capacitor.getPlatform();
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  try {
    if (platform === 'web') {
      const jeepSqliteEl = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqliteEl);
      await customElements.whenDefined('jeep-sqlite');
      await sqlite.initWebStore();
    }
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection('wtd', false)).result;
    let connection: SQLiteDBConnection | null = null;
    if (ret.result && isConn) {
      connection = await sqlite.retrieveConnection('wtd', false);
    } else {
      connection = await sqlite.createConnection('wtd', false, 'no-encryption', 1, false);
    }
    await connection.open();

    if (platform === 'web') {
      setInterval(async () => {
        await sqlite.saveToStore('wtd');
      }, 5000);
    }

    await sqlite.closeConnection('wtd', false);

    if (!db.isInitialized) {
      await db.initialize();
    }
    app.provide('dbInstance', db);
  } catch (err) {
    console.log(`Error: ${err}`);
    throw new Error(`Error: ${err}`);
  }
};

const store = createPinia();
const app = createApp(App, {
  async setup() {
    const { t } = useI18n();
    return { t };
  },
})
  .use(IonicVue)
  .use(router)
  .use(store)
  .use(i18n);

router.isReady().then(async () => {
  await initSqlite();
  app.mount('#app');
  defineCustomElements(window);
});
