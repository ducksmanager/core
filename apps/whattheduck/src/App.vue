<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <NavigationDrawer />
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';
import NavigationDrawer from '~/components/NavigationDrawer.vue';
import { collection } from './stores/collection';

const collectionStore = collection();

collectionStore.loadUser();
</script>
