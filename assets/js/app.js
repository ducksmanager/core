import Vue from "vue";
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue'

import * as Sentry from '@sentry/vue';
import {Integrations} from "@sentry/tracing";

import App from "./layouts/App"
import store from "./store"

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../css/app.scss';

new Vue({
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

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

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

