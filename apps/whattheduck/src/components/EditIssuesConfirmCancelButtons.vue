<template>
  <div v-if="!isOfflineMode" class="edit-issues-buttons">
    <ion-fab>
      <ion-fab-button color="light" @click="emit('cancel')"><ion-icon :ios="cancelIos" :md="cancelMd" /></ion-fab-button
    ></ion-fab>
    <ion-fab>
      <ion-fab-button :color="confirmColor" @click="emit('confirm')"
        ><ion-icon :ios="confirmIos" :md="confirmMd" /></ion-fab-button
    ></ion-fab>
  </div>
</template>
<script setup lang="ts">
import { app } from '~/stores/app';

const { isOfflineMode } = storeToRefs(app());

withDefaults(
  defineProps<{
    cancelIos: string;
    cancelMd: string;
    confirmIos: string;
    confirmMd: string;
    confirmColor?: string;
  }>(),
  {
    confirmColor: undefined,
  },
);

const emit = defineEmits<{ (e: 'cancel'): void; (e: 'confirm'): void }>();
</script>
<style lang="scss">
.edit-issues-buttons {
  position: fixed;
  width: 100%;
  bottom: 1rem;
  display: flex;
  justify-content: center;
  z-index: 2;
  opacity: 0.7;

  ion-fab {
    position: static;
    margin: 0 0.5rem;
  }
}
</style>