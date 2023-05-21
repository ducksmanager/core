import { Capacitor } from '@capacitor/core';
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
//import { applyPolyfills, defineCustomElements } from 'jeep-sqlite/loader';

customElements.define('jeep-sqlite', JeepSqlite);
console.log(`after customElements.define`);

const initSqlite = async () => {
  const platform = Capacitor.getPlatform();
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  try {
    console.log(`platform: ${platform}`);

    if (platform === 'web') {
      // Create the 'jeep-sqlite' Stencil component
      const jeepSqliteEl = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqliteEl);
      await customElements.whenDefined('jeep-sqlite');
      console.log(`after customElements.whenDefined`);

      // Initialize the Web store
      await sqlite.initWebStore();
      console.log(`after initWebStore`);
    }
    // here you can initialize some database schema if required

    // example: database creation with standard SQLite statements
    await sqlite.getFromLocalDiskToStore();
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection('db_vite', false)).result;
    let db = null;
    if (ret.result && isConn) {
      db = await sqlite.retrieveConnection('db_vite', false);
    } else {
      db = await sqlite.createConnection('db_vite', false, 'no-encryption', 1, false);
    }
    await db.open();
    console.log(`db: db_vite opened`);
    const query = `
        CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL
        );
        `;
    const res = await db.execute(query);
    console.log(`res: ${JSON.stringify(res)}`);
    if (res.changes?.changes && res.changes.changes < 0) {
      throw new Error(`Error: execute failed`);
    }
    const insertQuery = `INSERT INTO test (name) VALUES ('test')`;
    await db.execute(insertQuery);

    const resSelect = await db.query('SELECT * FROM test');
    console.log(`res: ${JSON.stringify(resSelect)}`);
    await sqlite.closeConnection('db_vite', false);
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
