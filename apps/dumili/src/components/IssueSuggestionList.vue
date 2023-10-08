<template>
  <suggestion-list
    :suggestions="issueSuggestions"
    :get-current="() => issue as IssueSuggestion"
    allow-customize-form
    :show-customize-form="showIssueSelect"
    @toggle-customize-form="showIssueSelect = $event"
    @select="acceptIssueSuggestion($event as IssueSuggestion)"
  >
    <template #item="suggestion: IssueSuggestion">
      <Issue
        :publicationcode="suggestion.data.publicationcode"
        :issuenumber="suggestion.data.issuenumber" /></template
    ><template #unknown>{{ $t("Numéro inconnu") }}</template>
    <template #customize-form>
      <IssueSelect
        @change="
          (issuecode) => addCustomIssuecodeToIssueSuggestions(issuecode)
        "
    /></template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import { IssueSuggestion, suggestions } from "~/stores/suggestions";

const { t: $t } = useI18n();

const showIssueSelect = ref(false);
const suggestionsStore = suggestions();

const issue = computed(() => suggestionsStore.acceptedIssue);
const issueSuggestions = computed(
  () =>
    suggestionsStore.issueSuggestions.filter(
      (suggestion) => suggestion !== undefined,
    ) as IssueSuggestion[],
);

const addCustomIssuecodeToIssueSuggestions = (issuecode: string | null) => {
  if (issuecode) {
    suggestionsStore.issueSuggestions =
      suggestionsStore.issueSuggestions.filter(
        ({ meta }) => meta.source !== "user",
      );
    const [publicationcode, issuenumber] = issuecode.split(" ");
    const userSuggestion = new IssueSuggestion(
      {
        publicationcode,
        issuenumber,
        issuecode,
        coverId: null,
      },
      {
        source: "user",
        isAccepted: false,
      },
    );
    suggestionsStore.issueSuggestions.push(userSuggestion);
    acceptIssueSuggestion(userSuggestion);
  }
};

const acceptIssueSuggestion = (suggestion?: IssueSuggestion) => {
  suggestionsStore.acceptSuggestion(
    suggestionsStore.issueSuggestions,
    (existingSuggestion) =>
      suggestion?.data?.issuecode === existingSuggestion.data.issuecode,
  );
  showIssueSelect.value = false;
};
</script>
