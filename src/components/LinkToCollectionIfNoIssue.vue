<template>
  <BAlert v-if="collection && !collection.length" variant="info">
    {{ $t("Vous ne possédez aucun numéro ! Cliquez") }}
    <a :href="r('/collection/show')">{{ $t("ici") }}</a>
    {{ $t("pour en ajouter à votre collection !") }}
  </BAlert>
</template>

<script setup>
import { useI18n } from "vue-i18n";

import { collection as collectionStore } from "~/stores/collection";
import { l10n } from "~/stores/l10n";

const collection = $computed(() => collectionStore().collection);
const { t: $t } = useI18n();
const { r } = l10n();
</script>

<style scoped>

</style>
