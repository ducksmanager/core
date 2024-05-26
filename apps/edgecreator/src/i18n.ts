import { createI18n } from "vue-i18n";

import fr from "../locales/fr-FR.json";

const messages = {
  "en-US": Object.keys(fr).reduce(
    (acc, value) => ({ ...acc, [value]: value }),
    {},
  ),
  fr,
};

const fallbackLocale = "en-US";
let locale = localStorage.getItem("locale");
if (!locale || !Object.keys(messages).includes(locale)) {
  locale = fallbackLocale;
  localStorage.setItem("locale", fallbackLocale);
}
const instance = createI18n({
  locale,
  fallbackLocale,
  formatFallbackMessages: true,
  silentTranslationWarn: true,
  messages,
  globalInjection: true,
  legacy: false,
});

export default instance;

export const i18n = instance.global;
