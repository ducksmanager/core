<template>
  <div v-if="total > 0">
    <div>
      {{ $t("Vous possédez") }} <b>{{ total }}</b>
      {{ $tc("numéro | numéros", total) }}, {{ $t("dont") }}
      {{ totalUniqueIssues }}
      {{ $tc("numéro unique | numéros uniques", totalUniqueIssues) }}.
    </div>
    <div>
      {{ $t("Votre collection est composée de") }}
      <b>{{ Object.keys(totalPerPublication).length }}</b>
      {{ $t("magazines différents issus de") }}
      <span
        v-html="
          $tc(
            '{countries} pays | {countries} pays',
            Object.keys(totalPerCountry).length,
            { countries: '<b>' + Object.keys(totalPerCountry).length + '</b>' }
          )
        "
      />.
    </div>
    <slot name="non-empty-collection" />
  </div>
  <div v-else>
    {{ $t("Votre collection est vide.") }}
    <slot name="empty-collection" />
  </div>
</template>

<script setup>
import { collection } from "../stores/collection";
let hasPublicationNames = $ref(false);
const collectionStore = collection(),
  total = $computed(() => collectionStore.total),
  totalUniqueIssues = $computed(() => collectionStore.totalUniqueIssues),
  totalPerCountry = $computed(() => collectionStore.totalPerCountry),
  totalPerPublication = $computed(() => collectionStore.totalPerPublication);
</script>

<style scoped>

</style>
