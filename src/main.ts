import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { useColorMode } from "bootstrap-vue-next";

useColorMode().value = "dark";
createApp(App).mount("#app");
