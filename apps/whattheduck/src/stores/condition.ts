import { defineStore } from 'pinia';

export const condition = defineStore('condition', () => ({
  conditionL10n: [
    { en: 'none', fr: 'indefini' },
    { en: 'bad', fr: 'mauvais' },
    { en: 'good', fr: 'bon' },
    { en: 'notsogood', fr: 'moyen' },
  ],
}));
