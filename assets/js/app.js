import "v-contextmenu/dist/themes/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";
import "../css/app.scss";

import { Integrations } from "@sentry/tracing";
import * as Sentry from "@sentry/vue";
import axios from "axios";
import BootstrapVue3, { BToastPlugin } from "bootstrap-vue-3";
import { createPinia } from "pinia";
import contextmenu from "v-contextmenu";
import { createApp, h } from "vue";

import { i18n } from "./i18n";
import App from "./layouts/App";
import { ongoingRequests } from "./stores/ongoing-requests";

let store = createPinia();

const useOngoingRequests = ongoingRequests(store);
axios.interceptors.request.use(
  (config) => {
    if (useOngoingRequests.numberOfOngoingAjaxCalls === null) {
      useOngoingRequests.numberOfOngoingAjaxCalls = 1;
    } else {
      useOngoingRequests.numberOfOngoingAjaxCalls++;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
axios.interceptors.response.use(
  (response) => {
    useOngoingRequests.numberOfOngoingAjaxCalls--;
    return response;
  },
  (error) => {
    useOngoingRequests.numberOfOngoingAjaxCalls--;
    return Promise.reject(error);
  }
);

const app = createApp({
  render() {
    return h(App);
  },
});
app.use(i18n);
app.use(store);
app.use(BootstrapVue3);
app.use(BToastPlugin);
app.use(contextmenu);
app.mount("#app");

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    app,
    dsn: "https://a225a6550b8c4c07914327618685a61c@sentry.ducksmanager.net/1385898",
    logErrors: true,
    environment: "vue-3",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    tracingOptions: {
      trackComponents: true,
    },
  });
}
