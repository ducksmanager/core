/* eslint-disable @typescript-eslint/ban-ts-comment */
import "v-contextmenu/dist/themes/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";

import { Integrations } from "@sentry/tracing";
import * as Sentry from "@sentry/vue";
import { createHead } from "@vueuse/head";
import axios from "axios";
import BootstrapVue3, { BToastPlugin } from "bootstrap-vue-3";
import Cookies from "js-cookie";
import { createPinia } from "pinia";
// @ts-ignore
import contextmenu from "v-contextmenu";
// @ts-ignore
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import App from "./App.vue";
import i18n from "./i18n.js";
import { ongoingRequests } from "./stores/ongoing-requests";
import { addUrlParamsRequestInterceptor } from "./util/url-params-request-interceptor";

const head = createHead();

const routes = setupLayouts(generatedRoutes);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
router.beforeResolve(async (to) => {
  if (!to.meta.public && !Cookies.get("token") && to.name !== "login") {
    return { name: "login" };
  }
});

const store = createPinia();

const useOngoingRequests = ongoingRequests(store);

declare module "axios" {
  interface AxiosRequestConfig {
    urlParams?: Record<string, string>;
  }
}

axios.defaults.baseURL = import.meta.env.VITE_GATEWAY_URL;

addUrlParamsRequestInterceptor(axios);

axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (config.headers && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (useOngoingRequests.numberOfOngoingAjaxCalls === null)
      useOngoingRequests.numberOfOngoingAjaxCalls = 1;
    else useOngoingRequests.numberOfOngoingAjaxCalls++;

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => {
    useOngoingRequests.numberOfOngoingAjaxCalls!--;
    return response;
  },
  (error) => {
    useOngoingRequests.numberOfOngoingAjaxCalls!--;
    return Promise.reject(error);
  }
);

const app = createApp(App);
app.use(i18n);
app.use(store);
app.use(BootstrapVue3);
app.use(BToastPlugin);
app.use(contextmenu);
app.use(head);
app.use(router);
app.mount("#app");

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    app,
    dsn: "https://a225a6550b8c4c07914327618685a61c@sentry.ducksmanager.net/1385898",
    logErrors: true,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    tracingOptions: {
      trackComponents: true,
    },
  });
}
