/* eslint-disable @typescript-eslint/ban-ts-comment */
import "v-contextmenu/dist/themes/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { Integrations } from "@sentry/tracing";
import * as Sentry from "@sentry/vue";
import { createHead } from "@unhead/vue";
import axios from "axios";
import Cookies from "js-cookie";
// @ts-ignore
import contextmenu from "v-contextmenu";
// @ts-ignore
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createRouter, createWebHistory } from "vue-router";

import App from "~/App.vue";
import i18n from "~/i18n";
import { addUrlParamsRequestInterceptor } from "~axios-helper";
import en from "~translations/messages.en.json";

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

addUrlParamsRequestInterceptor(axios);

const app = createApp(App);
app.use(i18n("fr", { en }).instance);
app.use(store);
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
