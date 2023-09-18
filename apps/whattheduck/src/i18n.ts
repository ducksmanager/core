import en from '../translations/en.json';
import fr from '../translations/fr.json';
import sv from '../translations/sv.json';

const messages = {
  en,
  sv,
  fr,
};

const fallbackLocale = 'fr';
let locale = localStorage.getItem('locale');
if (!locale || !Object.keys(messages).includes(locale)) {
  locale = fallbackLocale;
  localStorage.setItem('locale', fallbackLocale);
}
const instance = createI18n({
  legacy: false,
  locale,
  fallbackLocale,
  formatFallbackMessages: true,
  silentTranslationWarn: true,
  messages,
  globalInjection: true,
});

export default instance;

export const i18n = instance.global;
