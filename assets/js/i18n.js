import {createI18n} from "vue-i18n";

const fallbackLocale = "fr";
let locale = localStorage.getItem("locale");
if (!locale) {
  locale = fallbackLocale;
  localStorage.setItem("locale", fallbackLocale);
}

export const i18n = createI18n({
  locale,
  fallbackLocale,
  formatFallbackMessages: true,
  silentTranslationWarn: true,
  messages: locale === fallbackLocale ? {} : {
    [locale]: require(`../translations/messages.${locale}.json`)
  }
});
