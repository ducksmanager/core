<template>
  <ion-menu menu-id="app-menu" content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>Welcome!</ion-title>
      </ion-toolbar>
    </ion-header>
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
<script>
import {
  IonMenu,IonHeader,IonContent,IonToolbar,IonTitle,IonItem,IonList,IonLabel,
  menuController
} from "@ionic/vue";
export default {
  components: {
    IonMenu,IonHeader,IonContent,IonToolbar,IonTitle,IonItem,IonList,IonLabel,
  },
  methods:{
    menuNavigation(url){
      menuController.close("app-menu");
      this.$router.push(url);
    }
  }
};
</script>