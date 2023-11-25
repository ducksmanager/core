<route lang="yaml">
alias: [/collection/doubles]
</route>

<template>
  <div v-if="duplicateIssues && hasPublicationNames">
    <IssueList
      v-for="publicationcode in publicationCodes"
      :key="publicationcode"
      :publicationcode="publicationcode"
      duplicates-only
      :group-user-copies="false"
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

let hasPublicationNames = $ref(false as boolean);
let publicationCodes = $ref(null as string[] | null);

const { loadCollection } = collection();
const { duplicateIssues } = storeToRefs(collection());

const { loadIssuesOnSaleByOthers, loadIssueRequestsAsSeller } = marketplace();
const { buyerUserIds } = storeToRefs(marketplace());

const { fetchStats } = users();
const { fetchPublicationNames } = coa();

watch(
  duplicateIssues,
  async (value) => {
    if (value) {
      publicationCodes = [
        ...new Set(
          Object.values(value).reduce(
            (acc, issues) => [
              ...acc,
              ...issues.map(({ publicationcode }) => publicationcode),
            ],
            [] as string[],
          ),
        ),
      ];

      await fetchPublicationNames(publicationCodes);
      hasPublicationNames = true;
    }
  },
  { immediate: true },
);

(async () => {
  await loadCollection();

  await loadIssuesOnSaleByOthers();
  await loadIssueRequestsAsSeller();

  await fetchStats(buyerUserIds.value);
})();
</script>
