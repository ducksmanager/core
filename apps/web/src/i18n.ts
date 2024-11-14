import { createI18n } from "vue-i18n";

let instance: ReturnType<typeof createI18n>;

export default (
  locale: string,
  defaultLocale: string,
  translations: Record<string, Record<string, string>>,
) => {
  if (!instance) {
    const messages = {
      ...translations,
      [defaultLocale]: Object.fromEntries(
        Object.keys(translations[Object.keys(translations)[0]]).map((key) => [
          key,
          key,
        ]),
      ),
    };

    const fallbackLocale = defaultLocale;
    if (!locale || !Object.keys(messages).includes(locale)) {
      locale = fallbackLocale;
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
    console.log(messages);
  }
  return { instance, i18n: instance.global };
};
