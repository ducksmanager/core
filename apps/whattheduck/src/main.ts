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

import * as CordovaSQLiteDriver from "localforage-cordovasqlitedriver";
import { Storage } from "@ionic/storage";
import * as localforage from "localforage";

/*declare module "axios" {
  interface AxiosRequestConfig {
    urlParams?: Record<string, string>;
  }
}*/

const storage = new Storage({
  driverOrder: [CordovaSQLiteDriver._driver, localforage.INDEXEDDB],
});

storage.defineDriver(CordovaSQLiteDriver).then(async () => {
  await storage.create();
  await storage.set("token", process.env.VUE_APP_TOKEN);

  /*axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;
  axios.defaults.headers.common["Authorization"] = `Basic ${await storage.get(
    "token"
  )}`;*/

  const app = createApp(App).use(IonicVue).use(router).use(pinia);

  router.isReady().then(() => {
    app.mount("#app");
  });
});
