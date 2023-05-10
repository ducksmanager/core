<template>
  <ion-fab slot="fixed" vertical="bottom" horizontal="end">
    <ion-fab-button>
      <ion-icon :ios="pencilOutline" :md="pencilSharp"></ion-icon>
    </ion-fab-button>
    <ion-fab-list side="top">
      <ion-row class="ion-align-items-center">
        <ion-label>{{ t('by_cover_file') }}</ion-label>
        <ion-fab-button size="small"> <ion-icon :ios="imageOutline" :md="imageSharp"></ion-icon></ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center">
        <ion-label>{{ t('by_cover_photo') }}</ion-label>
        <ion-fab-button size="small"> <ion-icon :ios="cameraOutline" :md="cameraSharp"></ion-icon></ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center">
        <ion-label>{{ t('from_recent_issue') }}</ion-label>
        <ion-fab-button size="small"> <ion-icon :ios="calendarOutline" :md="calendarSharp"></ion-icon></ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center">
        <ion-label>{{ t('by_issue_selection') }}</ion-label>
        <ion-fab-button size="small"> <ion-icon :ios="listOutline" :md="listSharp"></ion-icon></ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center" router-link="/search">
        <ion-label>{{ t('by_story_title') }}</ion-label>
        <ion-fab-button size="small"> <ion-icon :ios="searchOutline" :md="searchSharp"></ion-icon></ion-fab-button>
      </ion-row>
    </ion-fab-list>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonFab, IonFabList, IonFabButton, IonIcon, IonLabel, IonRow } from '@ionic/vue';

import {
  pencilOutline,
  searchOutline,
  listOutline,
  cameraOutline,
  imageOutline,
  calendarOutline,
  pencilSharp,
  searchSharp,
  listSharp,
  cameraSharp,
  imageSharp,
  calendarSharp,
} from 'ionicons/icons';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style>
ion-fab-list {
  margin-left: -250px;
  align-items: end;
}
</style>
