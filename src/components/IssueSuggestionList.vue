<template>
  <suggestion-list
    :suggestions="issueSuggestions"
    :get-current="() => issue as IssueSuggestion"
    :show-customize-form="showIssueSelect"
    @show-customize-form="showIssueSelect = $event"
    @select="acceptIssueSuggestion($event as IssueSuggestion)"
  >
    <template #item="suggestion: IssueSuggestion">
      <Issue
        :publicationcode="suggestion.publicationcode"
        :issuenumber="suggestion.issuenumber" /></template
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
import { issueDetails, IssueSuggestion } from "~/stores/issueDetails";

const showIssueSelect = ref(false);
const issueDetailsStore = issueDetails();

const issue = computed(() => issueDetailsStore.issue);
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
    const userSuggestion: IssueSuggestion = {
      publicationcode,
      issuenumber,
      issuecode,
      coverId: null,
      type: "user",
    };
    issueDetailsStore.issueSuggestions.push(userSuggestion);
    acceptIssueSuggestion(userSuggestion);
  }
};

const acceptIssueSuggestion = (suggestion?: IssueSuggestion) => {
  issueDetailsStore.acceptIssueSuggestion(
    (suggestion as IssueSuggestion)?.issuecode || undefined
  );
  showIssueSelect.value = false;
};
</script>
