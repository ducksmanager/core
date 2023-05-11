<template>
  <ion-page>
    <ion-header>
      <ion-title>{{ t('issuenumbers_to_update', { issuenumber: issuecode }) }}</ion-title></ion-header
    >
    <ion-content>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="top">
          <ion-tab-button v-for="(_, idx) of copies" :tab="`copy-${idx}`" :href="`/edit-issues/copy/${idx}`">
            <ion-label>{{ t('copy_title', { index: idx + 1 }) }}</ion-label> </ion-tab-button
          ><ion-tab-button :tab="`copy-new`" :href="`/edit-issues/copy/new`" v-if="copies.length <= 2">
            <ion-label>{{ t('add_copy') }}</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonTabBar,
  IonHeader,
  IonTabButton,
  IonTabs,
  IonContent,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonTitle,
} from '@ionic/vue';
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { app } from '~/stores/app';
import { collection } from '~/stores/collection';

const appStore = app();
const collectionStore = collection();

const route = useRoute();

const { t } = useI18n();
const issuecode = computed(() => appStore.currentNavigationItem);
const copies = computed(() => collectionStore.issuesByIssueCode[issuecode.value!]);
</script>
