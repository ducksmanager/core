import { setup } from "@storybook/vue3";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import { createHead } from "@unhead/vue/client";
import { createPinia } from "pinia";

import i18n from "~web/src/i18n";
import de from "../locales/de.json";
import fr from "../locales/fr-FR.json";
import es from "../locales/es.json";
import "~styles/main.scss";

const head = createHead();

const store = createPinia();

setup((app) => {
  app
    .use(
      i18n("fr", localStorage.getItem("locale") || "fr", {
        de,
        fr,
        es,
      }).instance,
    )
    .use(store)
    .use(head);
});
