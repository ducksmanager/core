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
      <span
        v-html="
          t(
            '{countries} pays | {countries} pays',
            Object.keys(totalPerCountry).length,
            { countries: `<b>${Object.keys(totalPerCountry).length}</b>` },
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
import { collection } from '~/stores/collection'
import { useI18n } from "vue-i18n";
const hasPublicationNames = $ref(false)
const collectionStore = collection()
const total = $computed(() => collectionStore.total)
const totalUniqueIssues = $computed(() => collectionStore.totalUniqueIssues)
const totalPerCountry = $computed(() => collectionStore.totalPerCountry)
const totalPerPublication = $computed(() => collectionStore.totalPerPublication)

const {t} = useI18n()
</script>

<style scoped>

</style>
