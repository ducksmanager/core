<template>
  <b-dropdown class="my-2"
    ><b-dropdown-item
      v-for="issueSuggestion of issueSuggestions"
      :key="issueSuggestion.issuecode"
      class="d-flex"
      @click="acceptIssueSuggestion(issueSuggestion.issuecode)"
    >
      <Issue
        :publicationcode="issueSuggestion.publicationcode"
        :issuenumber="issueSuggestion.issuenumber" /><i-bi-lightbulb-fill
        v-if="issueSuggestion.type === 'ai'"
        class="ms-2"
        color="yellow"
    /></b-dropdown-item>
    <b-dropdown-divider v-if="issueSuggestions.length" />
    <b-dropdown-item @click="acceptIssueSuggestion(undefined)"
      >Numéro inconnu</b-dropdown-item
    >
    <b-dropdown-divider />
    <b-dropdown-item @click="showIssueSelect = true">{{
      $t("Personnaliser...")
    }}</b-dropdown-item>
    <template #button-content>
      <template v-if="showIssueSelect">{{ $t("Personnaliser...") }}</template>
      <div v-else class="d-flex">
        <Issue
          :publicationcode="issue.publicationcode || null"
          :issuenumber="issue.issuenumber || null"
        /><i-bi-lightbulb-fill
          v-if="issue.type === 'ai'"
          class="ms-2"
          color="yellow"
        /></div
    ></template>
  </b-dropdown>
  <IssueSelect
    v-if="showIssueSelect"
    @change="(issuecode) => addCustomIssuecodeToIssueSuggestions(issuecode)"
  />
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import { issueDetails, SuggestedIssue } from "~/stores/issueDetails";

const { t: $t } = useI18n();
const showIssueSelect = ref(false);
const issueDetailsStore = issueDetails();

const issue = computed(() => issueDetailsStore.issue);
const issueSuggestions = computed(() => issueDetailsStore.issueSuggestions);

const addCustomIssuecodeToIssueSuggestions = (issuecode: string | null) => {
  if (issuecode) {
    issueDetailsStore.issueSuggestions =
      issueDetailsStore.issueSuggestions.filter(
        ({ type }) => type !== "custom"
      );
    const [publicationcode, issuenumber] = issuecode.split(" ");
    const userSuggestion: SuggestedIssue = {
      publicationcode,
      issuenumber,
      issuecode,
      coverId: null,
      type: "custom",
    };
    issueDetailsStore.issueSuggestions.push(userSuggestion);
    acceptIssueSuggestion(issuecode);
  }
};

const acceptIssueSuggestion = (issuecode?: string) => {
  issueDetailsStore.acceptIssueSuggestion(issuecode);
  showIssueSelect.value = false;
};
</script>
