import "./styles/main.scss";
import "./styles/histoire.scss";
import "v-contextmenu/dist/themes/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";

import { defineSetupVue3 } from "@histoire/plugin-vue";
import { createHead } from "@vueuse/head";
import axios from "axios";
import BootstrapVue3, { BToastPlugin } from "bootstrap-vue-3";
import { createPinia } from "pinia";
import contextmenu from "v-contextmenu";
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createRouter, createWebHistory } from "vue-router";

import { i18n } from "./i18n.js";

export const setupVue3 = defineSetupVue3(({ app, story, variant }) => {
  const head = createHead();

  // const routes = setupLayouts(generatedRoutes);
  // const router = createRouter({
  //   history: createWebHistory(import.meta.env.BASE_URL),
  //   routes,
  // });

  const store = createPinia();
  axios.defaults.baseURL = import.meta.env.VITE_GATEWAY_URL;
  app.use(i18n);
  app.use(store);
  app.use(BootstrapVue3);
  app.use(BToastPlugin);
  app.use(contextmenu);
  app.use(head);
  // app.use(router);
});
