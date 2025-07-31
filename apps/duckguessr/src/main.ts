import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import * as Sentry from "@sentry/vue";
import { createHead } from "@unhead/vue/client";
import { createPinia } from "pinia";
import { SocketClient } from "socket-call-client";
import generatedRoutes from "virtual:generated-pages";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import App from "~/App.vue";
import de from "~locales/de.json";
import en from "~locales/en-US";
import es from "~locales/es.json";
import fr from "~locales/fr-FR.json";
import i18n from "~web/src/i18n";

const head = createHead();

const router = createRouter({
  history: createWebHistory(window.location.origin),
  routes: generatedRoutes,
});

const store = createPinia();

const app = createApp(App)
  .use(
    i18n("fr", localStorage.getItem("locale") || "fr", {
      de,
      en: await en(),
      fr,
      es,
    }).instance,
  )
  .use(store)
  .use(head)
  .use(router)
  .provide("dmSocket", new SocketClient(import.meta.env.VITE_DM_SOCKET_URL));

app.mount("#app");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: "https://a225a6550b8c4c07914327618685a61c@sentry.ducksmanager.net/1385898",
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
  });
}
