<route lang="yaml">
alias: [/collection/doubles]
</route>

<template>
  <div v-if="duplicateIssues && hasPublicationNames">
    <IssueList
      v-for="publicationcode in Object.keys(issueNumbersByPublicationCode)"
      :key="publicationcode"
      :publicationcode="publicationcode"
      duplicates-only
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
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";
let hasPublicationNames = $ref(false);
let issueNumbersByPublicationCode = $ref(null);
const duplicateIssues = $computed(() => collection().duplicateIssues);

watch(
  () => duplicateIssues,
  async (duplicateIssues) => {
    if (duplicateIssues) {
      issueNumbersByPublicationCode = {};
      Object.keys(duplicateIssues).forEach(
        ({ publicationcode, issuenumber }) => {
          if (!issueNumbersByPublicationCode[publicationcode])
            issueNumbersByPublicationCode[publicationcode] = [];

          issueNumbersByPublicationCode[publicationcode].push(issuenumber);
        }
      );

      await coa().fetchPublicationNames(
        Object.keys(issueNumbersByPublicationCode)
      );
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
