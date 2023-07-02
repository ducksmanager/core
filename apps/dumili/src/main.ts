import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { createRouter, createWebHistory } from "vue-router";
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";

import { useColorMode } from "bootstrap-vue-next";
import i18n from "./i18n.js";
import { createPinia } from "pinia";

const routes = setupLayouts(generatedRoutes);

const router = createRouter({
  history: createWebHistory(),
  routes,
});

useColorMode().value = "dark";
createApp(App).use(i18n).use(createPinia()).use(router).mount("#app");
