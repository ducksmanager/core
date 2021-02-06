import Vue from "vue";
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue'
import BackendDataPlugin from './plugins/backendDataPlugin'

import * as Sentry from '@sentry/vue';
import {Integrations} from "@sentry/tracing";

import App from "./layouts/App"
import store from "./store"
import { i18n } from "./i18n";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../css/app.scss';

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(BackendDataPlugin)

new Vue({
  i18n,
  store,
  render(createElement) {
    let props = {}, component = null
    const attributes = this.$el.attributes;
    Object.keys(attributes).forEach(key => {
      const {name, value} = attributes[key]
      if (name === 'component') {
        component = value
      } else {
        props[name] = value
      }
    })
    return createElement(App, {
      attrs: {
        props,
        component
      }
    })
  }
}).$mount('#app')

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    Vue,
    dsn: 'https://a225a6550b8c4c07914327618685a61c@sentry.io/1385898',
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
