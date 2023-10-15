import { defineStore } from 'pinia';

import { defaultApi } from '~/api';

export const api = defineStore('api', () => ({
  dmApi: ref(defaultApi),
}));
