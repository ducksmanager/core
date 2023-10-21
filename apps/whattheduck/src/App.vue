<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer v-if="isConnected" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { stores as webStores } from '~web';

import { User } from './persistence/models/dm/User';
import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';

import { coaApi, defaultApi } from '~/api';

const appStore = app();
const coaStore = webStores.coa();
const statsStore = webStores.stats();
const collectionStore = wtdcollection();
const route = useRoute();

onBeforeMount(() => {
  coaStore.setApi({ api: coaApi });
  statsStore.setApi({ api: defaultApi });
  collectionStore.setApi({
    api: defaultApi,
    sessionExistsFn: () =>
      app()
        .dbInstance.getRepository(User)
        .exist({ select: ['token'] }),
    clearSessionFn: async () => Promise.resolve(),
  });
});

const isConnected = computed(() => !!collectionStore.collection);

watch(
  () => route.query?.coa,
  (newValue) => {
    appStore.isCoaView = newValue === 'true';
  },
  { immediate: true },
);
</script>
