<template><ion-item class="ion-text-center">
    <ion-label color="danger">{{
      t(
        'La connexion à DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
      )
    }}</ion-label>
  </ion-item></template>

  <script setup lang="ts">
  const { t } = useI18n();
  </script>