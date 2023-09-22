<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { coa } from '~web/src/stores/coa';

import { app } from './stores/app';

import { coaApi } from '~/util/api';

const appStore = app();
const route = useRoute();

onBeforeMount(() => {
  coa().setApi(coaApi);
});

watch(
  () => route.query?.coa,
  (newValue) => {
    appStore.isCoaView = newValue === 'true';
  },
  { immediate: true },
);
</script>
