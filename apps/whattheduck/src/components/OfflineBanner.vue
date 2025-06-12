<template>
  <ion-item class="ion-text-center offline-banner">
    <ion-label color="danger">{{
      $t(
        'La connexion à DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
      )
    }}</ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import { app } from '~/stores/app';

const { offlineBannerHeight } = storeToRefs(app());

onUpdated(() => {
  setTimeout(() => {
    offlineBannerHeight.value = document.querySelector('.offline-banner')!.clientHeight;
  }, 10);
});

onMounted(() => {
  setTimeout(() => {
    offlineBannerHeight.value = document.querySelector('.offline-banner')!.clientHeight;
  }, 10);
});

onBeforeUnmount(() => {
  offlineBannerHeight.value = 0;
});
</script>
