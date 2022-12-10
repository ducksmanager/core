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
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";
let hasPublicationNames = $ref(false as boolean);
let publicationCodes = $ref(null as string[] | null);
const issuesInToReadStack = $computed(() => collection().issuesInToReadStack);

watch(
  () => issuesInToReadStack,
  async (issuesInToReadStack) => {
    if (issuesInToReadStack) {
      publicationCodes = [
        ...new Set(
          issuesInToReadStack.map(({ publicationCode }) => publicationCode)
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
