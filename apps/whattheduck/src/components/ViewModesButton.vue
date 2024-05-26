<template>
  <ion-fab ref="fab" v-if="issueViewModes" slot="fixed" vertical="top" horizontal="end" id="view-modes">
    <ion-fab-button :disabled="isOfflineMode"
      ><ion-icon :ios="eyeOutline" :android="eyeSharp"></ion-icon></ion-fab-button
    ><ion-icon class="indicator" :ios="currentIssueViewMode.icon.ios" :android="currentIssueViewMode.icon.md" />
    <ion-fab-list side="bottom">
      <ion-item
        button
        class="ion-align-items-center ion-text-nowrap"
        v-for="viewMode of issueViewModes"
        @click="
          currentIssueViewMode = viewMode;
          (fab?.$el as HTMLIonFabElement).close();
          isActivated = false;
        "
      >
        <ion-label>{{ viewMode.label }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="viewMode.icon.ios" :md="viewMode.icon.md" /></ion-fab-button></ion-item></ion-fab-list
  ></ion-fab>
</template>
<script setup lang="ts">
import { eyeOutline, eyeSharp } from 'ionicons/icons';

import { app } from '~/stores/app';

const { issueViewModes, isOfflineMode } = app();
const { currentIssueViewMode } = storeToRefs(app());

// eslint-disable-next-line no-undef
const fab = ref<ComponentPublicInstance<HTMLIonFabElement> | null>(null);
const isActivated = ref<boolean>(false);
</script>
<style scoped lang="scss">
ion-fab {
  display: flex;
  flex-direction: column;
  align-items: end;
  right: -0.3rem;

  ion-fab-list {
    margin-top: 2rem;
    right: -2.5rem;
    ion-item {
      padding-right: 2.5rem;
    }
  }

  ion-fab-button {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.75rem;
  }

  > ion-fab-button {
    margin-right: 1.5rem;
    width: 2rem;
    height: 2rem;
  }
}

ion-icon.indicator {
  background-color: darkgray;
  border-radius: 1rem;
  position: absolute;
  bottom: 0;
  right: 1rem;
  font-size: 1rem;
  margin-left: 0.5rem;
}
</style>
