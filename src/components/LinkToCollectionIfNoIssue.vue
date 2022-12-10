<template>
  <BAlert v-if="collection && !collection.length" variant="info">
    {{ $t("Vous ne possédez aucun numéro ! Cliquez") }}
    <router-link to="/collection/show">{{ $t("ici") }}</router-link>
    {{ $t("pour en ajouter à votre collection !") }}
  </BAlert>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { collection as collectionStore } from "~/stores/collection";

const collection = $computed(() => collectionStore().collection);
const { t: $t } = useI18n();
</script>

<style scoped>

</style>
