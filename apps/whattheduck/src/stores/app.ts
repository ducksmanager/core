import { defineStore } from 'pinia';
import type { DataSource } from 'typeorm';
import { inject, ref } from 'vue';

export const app = defineStore('app', {
  state: () => ({
    currentNavigationItem: ref(undefined as string | undefined),
    dbInstance: inject('dbInstance') as DataSource,
    isOfflineMode: ref(false),
  }),
});
