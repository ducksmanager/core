import { defineStore } from 'pinia';
import type { DataSource } from 'typeorm';
import { inject, ref } from 'vue';

import type { Sync } from '~/persistence/models/internal/Sync';

export const app = defineStore('app', {
  state: () => ({
    currentNavigationItem: ref(undefined as string | undefined),
    dbInstance: inject('dbInstance') as DataSource,
    isOfflineMode: ref(false),

    isObsoleteSync: (latestSync: Sync | null) =>
      !latestSync || new Date().getTime() - latestSync.timestamp.getTime() > 12 * 60 * 60 * 1000,
  }),
});
