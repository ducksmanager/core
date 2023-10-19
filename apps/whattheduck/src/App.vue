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

import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';

import { coaApi, defaultApi } from '~/api';

const appStore = app();
const coaStore = webStores.coa();
const collectionStore = wtdcollection();
const route = useRoute();

onBeforeMount(() => {
  coaStore.setApi(coaApi);
  collectionStore.setApi(defaultApi);
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
