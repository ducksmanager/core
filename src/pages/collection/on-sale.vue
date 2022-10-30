<route lang="yaml">
alias: [/collection/a-lire]
</route>

<template>
  <b-alert
    variant="info"
    show
    v-html="
      $t(
        `Sur cette page les numéros que vous avez indiqué comme 'A vendre' sont listés. rendez vous sur la page {1} pour consulter la liste des numéros que les autres utilisateurs DucksManager ont mis en vente.`,
        [`<a href='/expand/marketplace'>${$t('DucksManager marketplace')}</a>`]
      )
    "
  />
  <div v-if="issuesInOnSaleStack && hasPublicationNames">
    <IssueList
      v-for="publicationcode in publicationCodes"
      :key="publicationcode"
      :publicationcode="publicationcode"
      on-sale-stack-only
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
let hasPublicationNames = $ref(false);
let publicationCodes = $ref(null);
const issuesInOnSaleStack = $computed(() => collection().issuesInOnSaleStack);
const fetchPublicationNames = coa().fetchPublicationNames;
const loadCollection = collection().loadCollection;

watch(
  () => issuesInOnSaleStack,
  async (issuesInOnSaleStack) => {
    if (issuesInOnSaleStack) {
      publicationCodes = [
        ...new Set(
          issuesInOnSaleStack.map(({ publicationCode }) => publicationCode)
        ),
      ];

      await fetchPublicationNames(publicationCodes);
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadCollection();
});
</script>

<style scoped>
</style>
