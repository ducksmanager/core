import { defineStore } from 'pinia';
import type { DataSource } from 'typeorm';
import { inject } from 'vue';

export const app = defineStore('app', {
  state: () => ({
    currentNavigationItem: undefined as string | undefined,
    dbInstance: inject('dbInstance') as DataSource,
  }),
});
