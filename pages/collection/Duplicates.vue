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

import IssueList from "../../components/IssueList";
import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
let hasPublicationNames = $ref(false);
let issueNumbersByPublicationCode = $ref(null);
const duplicateIssues = $computed(() => collection().duplicateIssues);
const fetchPublicationNames = coa().fetchPublicationNames;
const loadCollection = collection().loadCollection;

watch(
  () => duplicateIssues,
  async (duplicateIssues) => {
    if (duplicateIssues) {
      issueNumbersByPublicationCode = {};
      Object.keys(duplicateIssues).forEach((issuecode) => {
        const [publicationcode, issuenumber] = issuecode.split(" ");
        if (!issueNumbersByPublicationCode[publicationcode]) {
          issueNumbersByPublicationCode[publicationcode] = [];
        }
        issueNumbersByPublicationCode[publicationcode].push(issuenumber);
      });

      await fetchPublicationNames(Object.keys(issueNumbersByPublicationCode));
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
