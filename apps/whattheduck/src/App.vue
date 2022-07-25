<template>
  <ion-app>
    <Drawer />
    <ion-router-outlet id="main-content"/>
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import Drawer from './components/Drawer.vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    Drawer
  }
});
</script>