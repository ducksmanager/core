import { watch } from "vue";
import { createI18n, useI18n } from "vue-i18n";

import fr from "~quackinator/locales/fr.json";
import type { Message } from "~quackinator/types";

/**
 * Quackinator is written in English, and an English message is its own key, so
 * the English catalogue is every key mapped to itself. A new language is one
 * file in `locales/`; a key it lacks is shown in English.
 */
const messages: Record<string, Record<string, string>> = {
  en: Object.fromEntries(Object.keys(fr).map((key) => [key, key])),
  fr,
};

/** The catalogue for a locale tag ("fr-FR", Dumili's "en-US"), else English. */
const catalogue = (tag: string) => {
  const language = tag.split("-")[0];
  return language in messages ? language : "en";
};

/** For the standalone app, which has no host to take a language from. */
export const createQuackinatorI18n = () =>
  createI18n({ legacy: false, locale: navigator.language });

/**
 * Quackinator's own catalogue, in the language of the app around it.
 *
 * A local scope, because a host like Dumili has an i18n instance of its own
 * whose catalogue knows nothing of Quackinator's text, and falls back to its
 * own language rather than to English. Only the locale is followed.
 */
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
    /** A message the API sent, in this language. */
    tm: (message: Message) => i18n.t(message.id, message.params),
    locale: i18n.locale,
  };
};
