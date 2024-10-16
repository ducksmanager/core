<template>
  <suggestion-list
    :suggestions="indexation!.issueSuggestions"
    :is-ai-source="(suggestion) => suggestion.source === 'ai'"
    :current="issue!"
    :show-customize-form="showIssueSelect"
    @toggle-customize-form="showIssueSelect = $event"
    @select="$event && acceptIssueSuggestion($event)"
  >
    <template #item="suggestion: issueSuggestion">
      <Issue v-bind="suggestion" /></template
    ><template #unknown-text>{{ $t("Numéro inconnu") }}</template>
    <template #customize-form>
      <IssueSelect
        @change="$event && createAndAcceptIssueSuggestion" /></template
    ><template #customize-text> {{ $t("Sélectionner...") }}</template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";

const { t: $t } = useI18n();

const showIssueSelect = ref(false);
const suggestionsStore = suggestions();
const { createIssueSuggestion } = suggestionsStore;
const { indexation, acceptedIssue: issue } = storeToRefs(suggestionsStore);

import { issueSuggestion } from "~prisma/client_dumili";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const acceptIssueSuggestion = async (suggestionId: number) => {
  await indexationSocket.value!.services.acceptIssueSuggestion(suggestionId);
  showIssueSelect.value = false;
};

const createAndAcceptIssueSuggestion = async (data: {
  publicationcode: string;
  issuenumber: string;
  issuecode: string;
}) => {
  const { suggestionId } = await createIssueSuggestion({
    ...data,
    source: "user",
  });
  await acceptIssueSuggestion(suggestionId);
};
</script>
