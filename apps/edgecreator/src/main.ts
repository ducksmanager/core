/* eslint-disable @typescript-eslint/ban-ts-comment */
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS

import { createHead } from "@vueuse/head";
import { BCarousel, BToastPlugin } from "bootstrap-vue-next";
import { createPinia } from "pinia";
// @ts-expect-error
import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import SimpleTypeahead from "vue3-simple-typeahead";

import App from "./App.vue";
import i18n from "./i18n";
const head = createHead();

const routes = setupLayouts(generatedRoutes);
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const store = createPinia();

const app = createApp(App);
app.component("BCarousel", BCarousel);
app.component("BCarouselSlide", BCarousel);

app.use(SimpleTypeahead);
app.use(i18n);
app.use(store);
app.use(BToastPlugin);
app.use(head);
app.use(router);
app.mount("#app");
