import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "~group-by";

import * as Sentry from "@sentry/vue";
import { createHead } from "@unhead/vue";
import { createBootstrap } from "bootstrap-vue-next";
import Cookies from "js-cookie";
import { SocketClient } from "socket-call-client";
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import VueDraggableResizable from "vue-draggable-resizable";
import { createRouter, createWebHistory } from "vue-router";

import App from "~/App.vue";
import i18n from "~/i18n";

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
  .use(createBootstrap())
  .use(i18n)
  .use(store)
  .use(head)
  .use(router)
  .provide("dmSocket", new SocketClient(import.meta.env.VITE_DM_SOCKET_URL))
  .provide(
    "dumiliSocket",
    new SocketClient(import.meta.env.VITE_DUMILI_SOCKET_URL),
  )
  .provide(
    "storySearchSocket",
    new SocketClient(import.meta.env.VITE_DM_STORY_SEARCH_SOCKET_URL),
  );

app.mount("#app");

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    app,
    dsn: process.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", process.env.VITE_DUMILI_SOCKET_URL!],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
