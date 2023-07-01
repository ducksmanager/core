import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { useColorMode } from "bootstrap-vue-next";
import i18n from "./i18n.js";
import { createPinia } from "pinia";

useColorMode().value = "dark";
createApp(App).use(i18n).use(createPinia()).mount("#app");
