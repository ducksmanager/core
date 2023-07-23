<template>
  <b-dropdown class="my-2"
    ><b-dropdown-item
      class="d-flex"
      @click="acceptIssueSuggestion(issueSuggestion.issuecode)"
      v-for="issueSuggestion of issueSuggestions"
    >
      <Issue
        :publicationcode="issueSuggestion.publicationcode"
        :issuenumber="issueSuggestion.issuenumber" /><i-bi-lightbulb-fill
        class="ms-2"
        color="yellow"
        v-if="issueSuggestion.isAi"
    /></b-dropdown-item>
    <b-dropdown-divider v-if="issueSuggestions.length" />
    <b-dropdown-item @click="acceptIssueSuggestion(undefined)"
      >Numéro inconnu</b-dropdown-item
    >
    <b-dropdown-divider />
    <b-dropdown-item @click="showIssueSelect = true"
      >Personnaliser...</b-dropdown-item
    >
    <template #button-content>
      <template v-if="showIssueSelect">Personnaliser...</template>
      <div class="d-flex" v-else>
        <Issue
          :publicationcode="issue.publicationcode || null"
          :issuenumber="issue.issuenumber || null"
        /><i-bi-lightbulb-fill
          class="ms-2"
          color="yellow"
          v-if="issue.isAi"
        /></div
    ></template>
  </b-dropdown>
  <IssueSelect
    v-if="showIssueSelect"
    @change="(issuecode) => addCustomIssuecodeToIssueSuggestions(issuecode)"
  />
</template>

<script lang="ts" setup>
import { SuggestedIssue, issueDetails } from "~/stores/issueDetails";

const showIssueSelect = ref(false);
const issueDetailsStore = issueDetails();

const issue = computed(() => issueDetailsStore.issue);
const issueSuggestions = computed(() => issueDetailsStore.issueSuggestions);

const addCustomIssuecodeToIssueSuggestions = (issuecode: string | null) => {
  if (issuecode) {
    issueDetailsStore.issueSuggestions =
      issueDetailsStore.issueSuggestions.filter(
        (issueSuggestion) => !issueSuggestion.isCustom
      );
    const [publicationcode, issuenumber] = issuecode.split(" ");
    const userSuggestion: SuggestedIssue = {
      publicationcode,
      issuenumber,
      issuecode,
      coverId: null,
      isCustom: true,
      isAi: false,
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
