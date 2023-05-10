<template>
  <ion-content class="ion-padding">
    <ion-title>{{ t('issuenumbers_to_update', { issuenumber }) }}</ion-title>

    <ion-tabs>
      <!-- Tab bar -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="account"> </ion-tab-button>
        <ion-tab-button tab="contact"> </ion-tab-button>
        <ion-tab-button tab="settings"> </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-content>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-button @click="cancel()">{{ t('cancel') }}</ion-button>
    </ion-buttons>
    <ion-buttons slot="end">
      <ion-button :strong="true" @click="confirm()">{{ t('ok') }}</ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>
<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonContent,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonIcon,
  IonNav,
  modalController,
} from '@ionic/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { app } from '~/stores/app';

const appStore = app();

const { t } = useI18n();
const issuenumber = computed(() => appStore.currentNavigationItem?.split(' ').findLast(() => true));

const cancel = () => {
  modalController.dismiss(null, 'cancel');
};
const confirm = () => {
  modalController.dismiss(null, 'confirm');
};
</script>
