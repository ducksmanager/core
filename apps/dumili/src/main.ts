import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { createRouter, createWebHistory } from "vue-router";
import generatedRoutes from "virtual:generated-pages";

import { useColorMode } from "bootstrap-vue-next";
import i18n from "./i18n.js";
import { createPinia } from "pinia";

const router = createRouter({
  history: createWebHistory(),
  routes: generatedRoutes,
});

axios.defaults.baseURL = import.meta.env.VITE_DM_API_URL;
useColorMode().value = "dark";
createApp(App).use(i18n).use(createPinia()).use(router).mount("#app");
