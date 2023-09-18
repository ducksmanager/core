<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { app } from './stores/app';

const appStore = app();
const route = useRoute();

watch(
  () => route.query?.coa,
  (newValue) => {
    appStore.isCoaView = newValue === 'true';
  },
  { immediate: true },
);
</script>
