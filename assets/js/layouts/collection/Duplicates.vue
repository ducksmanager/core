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
import IssueList from "../../components/IssueList";
import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
import { computed, onMounted, watch, ref } from "vue";
const hasPublicationNames = ref(false),
  issueNumbersByPublicationCode = ref(null),
  total = computed(() => collection().total),
  duplicateIssues = computed(() => collection().duplicateIssues),
  publicationNames = computed(() => coa().publicationNames),
  fetchPublicationNames = coa().fetchPublicationNames,
  loadCollection = collection().loadCollection;

watch(
  () => duplicateIssues.value,
  async (duplicateIssues) => {
    if (duplicateIssues) {
      issueNumbersByPublicationCode.value = {};
      Object.keys(duplicateIssues).forEach((issuecode) => {
        const [publicationcode, issuenumber] = issuecode.split(" ");
        if (!issueNumbersByPublicationCode.value[publicationcode]) {
          issueNumbersByPublicationCode.value[publicationcode] = [];
        }
        issueNumbersByPublicationCode.value[publicationcode].push(issuenumber);
      });

      await fetchPublicationNames(
        Object.keys(issueNumbersByPublicationCode.value)
      );
      hasPublicationNames.value = true;
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
