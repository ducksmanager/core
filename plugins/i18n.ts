import { createI18n } from "vue-i18n";

import en from "../translations/messages.en.json";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "fr",
  messages: {
    en,
  },
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(i18n);
});
