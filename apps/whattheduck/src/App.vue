<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer v-if="isConnected" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { User } from './persistence/models/dm/User';
import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';

import { buildStorage } from 'axios-cache-interceptor';
import { HttpCache } from './persistence/models/internal/HttpCache';
import { cacheStorage, session } from '~web/src/composables/useSocket';

const appStore = app();
const collectionStore = wtdcollection();
const route = useRoute();

onBeforeMount(() => {
  session.value = {
    getToken: () =>
      app()
        .dbInstance.getRepository(User)
        .findOneOrFail({ select: ['token'] })
        .then((user) => user.token),

    clearSession: async () => {
      await app().dbInstance.getRepository(User).delete(1);
    },
    onConnectError: () => {
      app().isOfflineMode = true;
    },
    sessionExists: async () =>
      app()
        .dbInstance.getRepository(User)
        .find({ select: ['token'] })
        .then((results) => results.length > 0),
  };

  cacheStorage.value = buildStorage({
    set: async (key, data) => {
      await app()
        .dbInstance.getRepository(HttpCache)
        .upsert({ key, data: JSON.stringify(data) }, ['key']);
    },
    find: async (key) => {
      const data = (await app().dbInstance.getRepository(HttpCache).findOne({ where: { key } }))?.data;
      if (data) {
        return JSON.parse(data);
      }
    },
    remove: async (key) => {
      await app().dbInstance.getRepository(HttpCache).delete({ key });
    },
  });
  collectionStore.loadUser();
});

const isConnected = computed(() => !!collectionStore.user);

watch(
  () => route.query?.coa,
  (newValue) => {
    appStore.isCoaView = newValue === 'true';
  },
  { immediate: true },
);
</script>
