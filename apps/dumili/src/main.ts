import "./style.scss";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { useColorMode } from "bootstrap-vue-next";
import generatedRoutes from "virtual:generated-pages";
// @ts-expect-error No type definitions available
import VueDraggableResizable from "vue-draggable-resizable";
import { createRouter, createWebHistory } from "vue-router";
import { plugin as Slicksort } from "vue-slicksort";

import App from "./App.vue";
import i18n from "./i18n.js";

const router = createRouter({
  history: createWebHistory(),
  routes: generatedRoutes,
});

useColorMode().value = "dark";
createApp(App)
  .component("vue-draggable-resizable", VueDraggableResizable)
  .use(i18n)
  .use(createPinia())
  .use(router)
  .use(Slicksort)
  .mount("#app");
