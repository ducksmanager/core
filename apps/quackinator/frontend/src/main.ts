import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { createBootstrap } from "bootstrap-vue-next";
import { createApp } from "vue";

import App from "./App.vue";
import { createQuackinatorI18n } from "./i18n";

createApp(App)
  .use(createBootstrap())
  .use(createQuackinatorI18n())
  .mount("#app");
