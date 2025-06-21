export const availableLocales: {
  key: string;
  shortKey: string;
  name: string;
  flagName: string;
}[] = [
  {
    key: 'en-US',
    shortKey: 'en',
    name: 'English',
    flagName: 'uk',
  },
  {
    key: 'fr',
    shortKey: 'fr',
    name: 'Français',
    flagName: 'fr',
  },
  {
    key: 'se',
    shortKey: 'se',
    name: 'Svenska',
    flagName: 'sv',
  },
];

export const getCurrentLocaleShortKey = (locale: string): string =>
  availableLocales.find(({ key }) => key === locale)?.shortKey || 'en';
