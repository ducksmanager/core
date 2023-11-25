<template>
  <b-alert v-if="issues && !issues.length" variant="info">
    {{ $t("Vous ne possédez aucun numéro ! Cliquez") }}
    <router-link to="/collection/show">{{ $t("ici") }}</router-link>
    {{ $t("pour en ajouter à votre collection !") }}
  </b-alert>
</template>

<script setup lang="ts">
const { issues } = storeToRefs(collection());
const { t: $t } = useI18n();
</script>
