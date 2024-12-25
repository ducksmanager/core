import { createI18n } from "vue-i18n";

import en from "~translations/messages.en.json";
import webEn from "~web/translations/messages.en.json";

const messages = {
  "en-US": { ...en, ...webEn },
  fr: Object.keys({ ...en, ...webEn }).reduce(
    (acc, value) => ({ ...acc, [value]: value }),
    {},
  ),
};

const fallbackLocale = "fr";
let locale = localStorage.getItem("locale");
if (!locale || !Object.keys(messages).includes(locale)) {
  locale = fallbackLocale;
  localStorage.setItem("locale", fallbackLocale);
}
const instance = createI18n({
  locale,
  legacy: false,
  fallbackLocale,
  formatFallbackMessages: true,
  silentTranslationWarn: true,
  messages,
  globalInjection: true,
});

export default instance;

export const i18n = instance.global;
