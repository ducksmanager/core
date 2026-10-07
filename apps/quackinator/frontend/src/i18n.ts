import { watch } from "vue";
import { createI18n, useI18n } from "vue-i18n";

import fr from "~quackinator/locales/fr.json";
import type { Message } from "~quackinator/types";

// English messages are their own keys; missing translations fall back to English.
const messages: Record<string, Record<string, string>> = {
  en: Object.fromEntries(Object.keys(fr).map((key) => [key, key])),
  fr,
};

const catalogue = (tag: string) => {
  const language = tag.split("-")[0];
  return language in messages ? language : "en";
};

export const createQuackinatorI18n = () => {
  document.documentElement.lang = catalogue(navigator.language);
  return createI18n({ legacy: false, locale: navigator.language });
};

// Local scope: a host's i18n doesn't know these messages. Only its locale is followed.
export const useQuackinatorI18n = () => {
  const host = useI18n({ useScope: "global" });
  const i18n = useI18n({
    useScope: "local",
    inheritLocale: false,
    locale: catalogue(host.locale.value),
    fallbackLocale: "en",
    messages,
    fallbackFormat: true,
    missingWarn: false,
    fallbackWarn: false,
  });
  watch(host.locale, (tag) => {
    i18n.locale.value = catalogue(tag);
  });
  return {
    t: i18n.t,
    tm: (message: Message) => i18n.t(message.id, message.params),
    locale: i18n.locale,
  };
};
