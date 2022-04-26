import {createApp, h} from "vue";
import BootstrapVue3 from 'bootstrap-vue-3'

import * as Sentry from '@sentry/vue';
import {Integrations} from "@sentry/tracing";

import App from "./layouts/App"
import {i18n} from "./i18n";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

import '../css/app.scss';
import {createPinia} from "pinia";
import axios from "axios";
import {ongoingRequests} from "./stores/ongoing-requests";

let store = createPinia();

const useOngoingRequests = ongoingRequests(store);
axios.interceptors.request.use(config => {
  if (useOngoingRequests.numberOfOngoingAjaxCalls === null) {
    useOngoingRequests.numberOfOngoingAjaxCalls = 1
  } else {
    useOngoingRequests.numberOfOngoingAjaxCalls++;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});
axios.interceptors.response.use(response => {
  useOngoingRequests.numberOfOngoingAjaxCalls--;
  return response;
}, error => {
  useOngoingRequests.numberOfOngoingAjaxCalls--;
  return Promise.reject(error);
});

const app = createApp({
  render() {
    return h(App)
  }
})

app.config.globalProperties.imagePath = localStorage.getItem('imagePath') || undefined

app.use(i18n)
app.use(store)
app.use(BootstrapVue3)
app.mount('#app')

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    app,
    dsn: 'https://a225a6550b8c4c07914327618685a61c@sentry.ducksmanager.net/1385898',
    logErrors: true,

    integrations: [
      new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,
    tracingOptions: {
      trackComponents: true,
    },
  });
}
