import "./style.scss";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import axios from "axios";
import { useColorMode } from "bootstrap-vue-next";
import { createPinia } from "pinia";
import generatedRoutes from "virtual:generated-pages";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import App from "./App.vue";
import i18n from "./i18n.js";

const router = createRouter({
  history: createWebHistory(),
  routes: generatedRoutes,
});

axios.defaults.baseURL = import.meta.env.VITE_DM_API_URL;
useColorMode().value = "dark";
createApp(App).use(i18n).use(createPinia()).use(router).mount("#app");
