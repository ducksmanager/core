import { createI18n } from "vue-i18n";

import en from "../translations/messages.en.json";

const messages = {
  "en-US": en,
  fr: Object.keys(en).reduce((acc, value) => ({ ...acc, [value]: value }), {}),
};

const fallbackLocale = "fr";
let locale = localStorage.getItem("locale");
if (!locale || !Object.keys(messages).includes(locale)) {
  locale = fallbackLocale;
  localStorage.setItem("locale", fallbackLocale);
}
export const i18n = createI18n({
  locale,
  fallbackLocale,
  formatFallbackMessages: true,
  silentTranslationWarn: true,
  messages,
  globalInjection: true,
});
