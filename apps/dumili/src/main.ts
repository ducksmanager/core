import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { browserTracingIntegration } from "@sentry/browser";
import * as Sentry from "@sentry/vue";
import { createHead } from "@unhead/vue";
import Cookies from "js-cookie";
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createRouter, createWebHistory } from "vue-router";

import App from "~/App.vue";
import i18n from "~/i18n";
import { SocketClient } from "~socket.io-client-services";
import VueDraggableResizable from "vue-draggable-resizable";

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
  .component("vue-draggable-resizable", VueDraggableResizable)
  .use(i18n)
  .use(store)
  .use(head)
  .use(router)
  .provide("dmSocket", new SocketClient(import.meta.env.VITE_DM_SOCKET_URL))
  .provide(
    "dumiliSocket",
    new SocketClient(import.meta.env.VITE_DUMILI_SOCKET_URL),
  );

app.mount("#app");

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    app,
    dsn: "https://a225a6550b8c4c07914327618685a61c@sentry.ducksmanager.net/1385898",
    logErrors: true,
    integrations: [browserTracingIntegration],
    tracesSampleRate: 1.0,
    tracingOptions: {
      trackComponents: true,
    },
  });
}
