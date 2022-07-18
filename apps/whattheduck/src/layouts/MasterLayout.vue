<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons @click="openMenu()" slot="start">
          <ion-icon :icon="menu" slot="start"></ion-icon>
        </ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <slot></slot>
    </ion-content>
  </ion-page>
</template>
<script>
import {
  IonPage,IonHeader,IonContent,IonTitle,IonToolbar,IonButtons,IonIcon,
  menuController,
} from "@ionic/vue";
import { menu } from "ionicons/icons";
export default {
  components: {
    IonPage,IonHeader,IonContent,IonTitle,IonToolbar,IonButtons,IonIcon,
  },
  props: ["pageTitle"],
  data() {
    return {
      menu,
    };
  },
  methods: {
    openMenu() {
      menuController.open("app-menu");
    },
  },
};
</script>