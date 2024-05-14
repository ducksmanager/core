/* eslint-disable @typescript-eslint/ban-ts-comment */
import "v-contextmenu/dist/themes/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { Integrations } from "@sentry/tracing";
import * as Sentry from "@sentry/vue";
import { createHead } from "@unhead/vue";
import Cookies from "js-cookie";
// @ts-ignore
import contextmenu from "v-contextmenu";
// @ts-ignore
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createRouter, createWebHistory } from "vue-router";

import App from "~/App.vue";
import i18n from "~/i18n";
import { useSocket } from "~socket.io-client-services";
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

const app = createApp(App)
  .use(i18n("fr", { en }).instance)
  .use(store)
  .use(contextmenu)
  .use(head)
  .use(router)
  .provide("socket", useSocket(import.meta.env.VITE_DM_SOCKET_URL));

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
