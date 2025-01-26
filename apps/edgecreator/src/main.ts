import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS

import "~group-by";
import { createHead } from "@unhead/vue";
import { createBootstrap } from "bootstrap-vue-next";
import { createPinia } from "pinia";
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createApp } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import SimpleTypeahead from "vue3-simple-typeahead";

import { SocketClient } from "~socket.io-client-services";

import App from "./App.vue";
import i18n from "./i18n";
const head = createHead();

const routes = setupLayouts(generatedRoutes) as RouteRecordRaw[];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const store = createPinia();

createApp(App)
  .use(SimpleTypeahead)
  .use(createBootstrap())
  .use(i18n)
  .use(store)
  .use(head)
  .use(router)
  .provide("dmSocket", new SocketClient(import.meta.env.VITE_DM_SOCKET_URL))
  .provide(
    "edgecreatorSocket",
    new SocketClient(import.meta.env.VITE_EDGECREATOR_SOCKET_URL),
  )
  .mount("#app");
