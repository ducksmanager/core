<template>
  <ion-menu menu-id="app-menu" content-id="main-content">
    <ion-header>
      <ion-toolbar color="light">
        <ion-title>What The Duck</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-grid>
        <ion-row> Medals </ion-row>
        <ion-list>
          <ion-item button @click="menuNavigation('/collection')">
            <ion-label>My collection</ion-label>
          </ion-item>
          <ion-item button @click="menuNavigation('/about')">
            <ion-label>About</ion-label>
          </ion-item>
        </ion-list>
        <ion-row className="ion-align-items-end" style="flex-direction: column">
          <ion-col className="ion-align-self-center">
            Report a problem
          </ion-col>
          <ion-col> Logout </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-menu>
</template>
<script setup lang="ts">
import {
  IonHeader,
  IonMenu,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonItem,
  IonList,
  IonLabel,
  IonToolbar,
  IonTitle,
  useIonRouter,
  menuController,
} from "@ionic/vue";

const router = useIonRouter();
const menuNavigation = (url: string) => {
  menuController.close("app-menu");
  router.push(url);
};
</script>

<style lang="scss">
ion-grid {
  height: 100%;
  display: flex;
  flex-direction: column;

  ion-row {
    flex-grow: 1;
  }
}
</style>
