<template>
  <div v-if="total > 0">
    <div>
      {{ $t("Vous possédez") }} <b>{{ total }}</b>
      {{ t("numéro | numéros", total) }}, {{ $t("dont") }}
      {{ totalUniqueIssues }}
      {{ t("numéro unique | numéros uniques", totalUniqueIssues) }}.
    </div>
    <div>
      {{ $t("Votre collection est composée de") }}
      <b>{{ Object.keys(totalPerPublication).length }}</b>
      {{ $t("magazines différents issus de") }}
      <b>{{ Object.keys(totalPerCountry).length }}</b>
      {{ t("pays | pays", Object.keys(totalPerCountry).length) }}.
    </div>
    <slot name="non-empty-collection" />
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";
const collectionStore = collection();
const total = $computed(() => collectionStore.total);
const totalUniqueIssues = $computed(() => collectionStore.totalUniqueIssues);
const totalPerCountry = $computed(() => collectionStore.totalPerCountry);
const totalPerPublication = $computed(
  () => collectionStore.totalPerPublication
);

const { t } = useI18n();
</script>

<style scoped>

</style>
