<template>
  <ion-page>
    <ion-content>
      <ion-title>{{ t('issuenumbers_to_update', { issuenumber }) }}</ion-title>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="top">
          <ion-tab-button tab="tab1" :href="`${route.path}/copy0`">
            <ion-icon :icon="triangle" />
            <ion-label>Tab 1</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" :href="`${route.path}/copy1`">
            <ion-icon :icon="ellipse" />
            <ion-label>Tab 2</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonContent,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonTitle,
} from '@ionic/vue';
import { ellipse, triangle } from 'ionicons/icons';
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { app } from '~/stores/app';

const route = useRoute();

const { t } = useI18n();
const issuenumber = computed(() => route.path.split(/( )|(%20)/).findLast(() => true));
</script>
