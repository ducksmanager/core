<template>
  <suggestion-list
    :suggestions="issueSuggestions"
    :get-current="() => issue"
    @select="acceptIssueSuggestion($event as SuggestedIssue)"
  >
    <template #item="{ suggestion }: { suggestion: SuggestedIssue }">
      <Issue
        :publicationcode="suggestion.publicationcode"
        :issuenumber="suggestion.issuenumber" /></template
    ><template #unknown>Numéro inconnu</template
    ><template #customize>{{ $t("Personnaliser...") }}</template>
    <template #customize-form>
      <IssueSelect
        v-if="showIssueSelect"
        @change="
          (issuecode) => addCustomIssuecodeToIssueSuggestions(issuecode)
        "
    /></template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import { issueDetails, SuggestedIssue } from "~/stores/issueDetails";

const { t: $t } = useI18n();
const showIssueSelect = ref(false);
const issueDetailsStore = issueDetails();

const issue = computed(() => issueDetailsStore.issue);
const issueSuggestions = computed(
  () => issueDetailsStore.issueSuggestions as SuggestedIssue[]
);

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
    acceptIssueSuggestion(userSuggestion);
  }
};

const acceptIssueSuggestion = (suggestion?: SuggestedIssue) => {
  issueDetailsStore.acceptIssueSuggestion(suggestion?.issuecode);
  showIssueSelect.value = false;
};
</script>
