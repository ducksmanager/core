import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { createPinia } from "pinia";
import axios from "axios";

const pinia = createPinia();

const sha1 = async (str: string) => {
  const buffer = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-1", buffer).then((hash) => {
    const hexCodes = [];
    const view = new DataView(hash);
    for (let i = 0; i < view.byteLength; i++) {
      const byte = view.getUint8(i).toString(16).padEnd(2, "0");
      hexCodes.push(byte);
    }
    return hexCodes.join("");
  });
};

import * as CordovaSQLiteDriver from "localforage-cordovasqlitedriver";
import { Storage } from "@ionic/storage";
import * as localforage from "localforage";

const storage = new Storage({
  driverOrder: [CordovaSQLiteDriver._driver, localforage.INDEXEDDB],
});

storage.defineDriver(CordovaSQLiteDriver).then(async () => {
  await storage.create();
  await storage.set("name", "Mr. Ionitron");
  console.log(await storage.keys());
});

sha1(process.env.VUE_APP_USER_PASSWORD).then((passwordHash: string) => {
  axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;
  axios.defaults.headers.common["Authorization"] = `Basic ${btoa(
    `${process.env.VUE_APP_ROLE_NAME}:${process.env.VUE_APP_ROLE_PASSWORD}`
  )}`;
  axios.defaults.headers.common["x-dm-version"] = `1.0.0`;
  axios.defaults.headers.common["x-dm-user"] = `demo`;
  axios.defaults.headers.common["x-dm-pass"] = passwordHash;

  const app = createApp(App).use(IonicVue).use(router).use(pinia);

  router.isReady().then(() => {
    app.mount("#app");
  });
});
