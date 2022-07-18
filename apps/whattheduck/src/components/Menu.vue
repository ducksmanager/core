<template>
  <ion-menu menu-id="app-menu" content-id="main-content">
    <ion-content>
      <ion-list>
        <ion-item button @click="menuNavigation('/collection')">
          <ion-label>My collection</ion-label>
        </ion-item>
        <ion-item button @click="menuNavigation('/about')">
          <ion-label>About</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>
<script setup lang="ts">
import {
  IonMenu, IonContent, IonItem, IonList, IonLabel, useIonRouter, menuController,
} from "@ionic/vue";

const router = useIonRouter();
const menuNavigation = (url: string) => {
  menuController.close("app-menu");
  router.push(url);
}
</script>