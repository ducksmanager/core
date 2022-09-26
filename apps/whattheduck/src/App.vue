<template>
  <ion-app>
    <Drawer />
    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import Drawer from "./components/Drawer.vue";
</script>
