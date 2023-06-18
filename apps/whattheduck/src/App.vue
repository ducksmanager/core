<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer />
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

import { app } from './stores/app';
import { watch } from 'vue';

const appStore = app();
const route = useRoute();

watch(
  () => route.query?.coa,
  (newValue) => {
    appStore.isCoaView = newValue === 'true';
  },
  { immediate: true }
);
</script>
