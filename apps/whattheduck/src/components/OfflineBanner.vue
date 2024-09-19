<template>
  <ion-item class="ion-text-center offline-banner">
    <ion-label color="danger" v-if="isOfflineMode === 'offline_no_cache' || onOffline !== 'readonly'">{{
      t(
        'La connexion à DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
      )
    }}</ion-label>
    <ion-label color="warning" v-else>
      {{
        t(
          'Vous êtes en mode hors-ligne. Vous pouvez naviguer dans votre collection mais pas la modifier. Certaines fonctionnalités ne sont pas disponibles.',
        )
      }}
    </ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import { app } from '~/stores/app';

const { t } = useI18n();

defineProps<{
  onOffline: 'readonly' | 'unavailable' | undefined;
}>();

const { offlineBannerHeight, isOfflineMode } = storeToRefs(app());

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
