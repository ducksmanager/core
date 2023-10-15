<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer v-if="isConnected" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { coa } from '~web/src/stores/coa';
import { collection } from '~/stores/collection';

import { app } from './stores/app';

import { coaApi } from '~/api';

const appStore = app();
const collectionStore = collection();
const route = useRoute();

onBeforeMount(() => {
  coa().setApi(coaApi);
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
