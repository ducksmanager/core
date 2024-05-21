<template>
  <ion-item class="ion-text-center">
    <ion-label color="warning" v-if="onOffline === 'readonly'">
      {{
        t(
          'Vous êtes en mode hors-ligne. Vous pouvez naviguer dans votre collection mais pas la modifier. Certaines fonctionnalités ne sont pas disponibles.',
        )
      }}
    </ion-label>
    <ion-label color="danger" v-else>{{
      t(
        'La connexion à DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
      )
    }}</ion-label>
  </ion-item>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  onOffline: 'readonly' | 'unavailable' | undefined;
}>();
</script>
