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
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";
let hasPublicationNames = $ref(false as boolean);
let publicationCodes = $ref(null as string[] | null);
const duplicateIssues = $computed(() => collection().duplicateIssues);

watch(
  () => duplicateIssues,
  async (duplicateIssues) => {
    if (duplicateIssues) {
      publicationCodes = [
        ...new Set(
          Object.values(duplicateIssues).reduce(
            (acc, issues) => [
              ...acc,
              ...issues.map(({ publicationcode }) => publicationcode),
            ],
            [] as string[]
          )
        ),
      ];

      await coa().fetchPublicationNames(publicationCodes);
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await collection().loadCollection();

  await marketplace().loadIssuesOnSaleByOthers();
  await marketplace().loadIssueRequestsAsSeller();

  await users().fetchStats(marketplace().buyerUserIds);
});
</script>

<style scoped>
</style>
