<template>
  <ion-fab ref="fab" v-if="issueViewModes" vertical="top" horizontal="end" id="view-modes" slot="fixed">
    <ion-fab-button :disabled="isOfflineMode"
      ><ion-icon :ios="eyeOutline" :android="eyeSharp"></ion-icon></ion-fab-button
    ><ion-icon class="indicator" :ios="currentIssueViewMode.icon.ios" :android="currentIssueViewMode.icon.md" />
    <ion-fab-list side="bottom">
      <ion-item
        :detail="false"
        button
        class="ion-align-items-center ion-text-nowrap"
        :class="{ selected: currentIssueViewMode.id === viewMode.id }"
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

const { issueViewModes } = app();
const { isOfflineMode, currentIssueViewMode } = storeToRefs(app());

// eslint-disable-next-line no-undef
const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);
const isActivated = ref(false);
</script>
<style scoped lang="scss">
ion-fab {
  &[hidden] {
    display: block;
  }
  ion-fab-list {
    margin-top: 3rem;
    right: -2.5rem;
    ion-item {
      padding-right: 2.5rem;

      &.selected {
        ::part(native) {
          border: 1px solid darkgray;
        }
      }
    }
  }

  ion-fab-button {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.75rem;

    ion-icon {
      font-size: 20px;
    }
  }

  > ion-fab-button {
    margin-right: 1rem;
    width: 1.8rem;
    height: 1.8rem;
  }
}

ion-icon.indicator {
  background-color: darkgray;
  border-radius: 1rem;
  position: absolute;
  bottom: 0;
  right: 0.5rem;
  font-size: 1rem;
  margin-left: 0.5rem;
}
</style>
