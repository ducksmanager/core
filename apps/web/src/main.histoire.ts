/* eslint-disable @typescript-eslint/ban-ts-comment */
import "./styles/main.scss";
import "./styles/histoire.scss";
import "v-contextmenu/dist/themes/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { defineSetupVue3 } from "@histoire/plugin-vue";
import { createHead } from "@unhead/vue";
// @ts-ignore
import contextmenu from "v-contextmenu";

import i18n from "~/i18n";
import en from "~translations/messages.en.json";

export const setupVue3 = defineSetupVue3(({ app }) => {
  const head = createHead();

  const store = createPinia();
  app.use(i18n("fr", "fr", { en }).instance);
  app.use(store);
  app.use(contextmenu);
  app.use(head);
});
