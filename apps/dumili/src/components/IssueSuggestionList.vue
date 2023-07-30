<template>
  <suggestion-list
    :suggestions="issueSuggestions"
    :get-current="() => issue as IssueSuggestion"
    allow-customize-form
    :show-customize-form="showIssueSelect"
    @show-customize-form="showIssueSelect = $event"
    @select="acceptIssueSuggestion($event as IssueSuggestion)"
  >
    <template #item="suggestion: IssueSuggestion">
      <Issue
        :publicationcode="suggestion.data.publicationcode"
        :issuenumber="suggestion.data.issuenumber" /></template
    ><template #unknown>Numéro inconnu</template>
    <template #customize-form>
      <IssueSelect
        @change="
          (issuecode) => addCustomIssuecodeToIssueSuggestions(issuecode)
        "
    /></template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { IssueSuggestion, suggestions } from "~/stores/suggestions";

const showIssueSelect = ref(false);
const issueDetailsStore = suggestions();

const issue = computed(() => issueDetailsStore.acceptedIssue);
const issueSuggestions = computed(
  () =>
    issueDetailsStore.issueSuggestions.filter(
      (suggestion) => suggestion !== undefined
    ) as IssueSuggestion[]
);

const addCustomIssuecodeToIssueSuggestions = (issuecode: string | null) => {
  if (issuecode) {
    issueDetailsStore.issueSuggestions =
      issueDetailsStore.issueSuggestions.filter(({ type }) => type !== "user");
    const [publicationcode, issuenumber] = issuecode.split(" ");
    const userSuggestion = new IssueSuggestion(
      {
        publicationcode,
        issuenumber,
        issuecode,
      },
      {
        type: "user",
        isAccepted: false,
      },
      null
    );
    issueDetailsStore.issueSuggestions.push(userSuggestion);
    acceptIssueSuggestion(userSuggestion);
  }
};

const acceptIssueSuggestion = (suggestion?: IssueSuggestion) => {
  issueDetailsStore.acceptSuggestion(
    issueDetailsStore.issueSuggestions,
    (existingSuggestion) =>
      suggestion?.data?.issuecode === existingSuggestion.data.issuecode
  );
  showIssueSelect.value = false;
};
</script>
