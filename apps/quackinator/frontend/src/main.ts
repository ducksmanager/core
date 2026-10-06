import { createApp } from "vue";

import App from "./App.vue";
import { createQuackinatorI18n } from "./i18n";
import "./style.css";

createApp(App).use(createQuackinatorI18n()).mount("#app");
