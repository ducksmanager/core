<route lang="yaml">
alias: [/collection/a-lire]
</route>

<template>
  <div v-if="issuesInToReadStack && hasPublicationNames">
    <IssueList
      v-for="publicationcode in publicationCodes"
      :key="publicationcode"
      :publicationcode="publicationcode"
      read-stack-only
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
let hasPublicationNames = $ref(false as boolean);
let publicationCodes = $ref(null as string[] | null);

const { loadCollection } = collection();
const { issuesInToReadStack } = storeToRefs(collection());

const { fetchPublicationNames } = coa();

const { loadIssuesOnSaleByOthers, loadIssueRequestsAsSeller } = marketplace();
const { buyerUserIds } = storeToRefs(marketplace());

const { fetchStats } = users();

watch(
  issuesInToReadStack,
  async (issuesInToReadStack) => {
    if (issuesInToReadStack) {
      publicationCodes = [
        ...new Set(
          issuesInToReadStack.map(({ publicationcode }) => publicationcode),
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
