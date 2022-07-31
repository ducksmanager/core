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
<script setup>
import { onMounted, watch } from "vue";

import IssueList from "../../components/IssueList";
import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
let hasPublicationNames = $ref(false),
  publicationCodes = $ref(null);
const total = $computed(() => collection().total),
  issuesInToReadStack = $computed(() => collection().issuesInToReadStack),
  publicationNames = $computed(() => coa().publicationNames),
  fetchPublicationNames = coa().fetchPublicationNames,
  loadCollection = collection().loadCollection;

watch(
  () => issuesInToReadStack,
  async (issuesInToReadStack) => {
    if (issuesInToReadStack) {
      publicationCodes = [
        ...new Set(
          issuesInToReadStack.map(({ publicationCode }) => publicationCode)
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
