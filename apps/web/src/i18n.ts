import { createI18n } from "vue-i18n";

let instance: ReturnType<typeof createI18n>;

export default (
  defaultLocale: string,
  translations: Record<string, Record<string, string>>,
) => {
  if (!instance) {
    const messages = {
      ...translations,
      [defaultLocale]: Object.keys(
        translations[Object.keys(translations)[0]],
      ).reduce((acc, value) => ({ ...acc, [value]: value }), {}),
    };

    const fallbackLocale = defaultLocale;
    let locale = localStorage.getItem("locale");
    if (!locale || !Object.keys(messages).includes(locale)) {
      locale = fallbackLocale;
      localStorage.setItem("locale", fallbackLocale);
    }
    instance = createI18n({
      legacy: false,
      locale,
      fallbackLocale,
      formatFallbackMessages: true,
      silentTranslationWarn: true,
      messages,
      globalInjection: true,
    });
  }
  return { instance, i18n: instance.global };
};
