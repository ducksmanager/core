import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { BrowserTracing } from "@sentry/browser";
import * as Sentry from "@sentry/vue";
import { createHead } from "@unhead/vue";
import { createPinia } from "pinia";
// @ts-ignore
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import App from "~/App.vue";
import i18n from "~web/src/i18n";
import de from "~locales/de.json";
import fr from "~locales/fr-FR.json";
import en from "~locales/en-US";
import es from "~locales/es.json";

const head = createHead();

const routes = setupLayouts(generatedRoutes);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const store = createPinia();

const app = createApp(App);
app.use(i18n("fr", { de, en: await en(), fr, es }).instance);
app.use(store);
app.use(head);
app.use(router);
app.mount("#app");

if (import.meta.env.NODE_ENV === "production") {
  Sentry.init({
    app,
    dsn: "https://a225a6550b8c4c07914327618685a61c@sentry.ducksmanager.net/1385898",
    logErrors: true,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    tracingOptions: {
      trackComponents: true,
    },
  });
}
