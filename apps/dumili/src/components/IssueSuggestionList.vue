<template>
  <suggestion-list
    v-model="indexation!.acceptedIssueSuggestion"
    :suggestions="indexation!.issueSuggestions"
    :is-ai-source="(suggestion) => suggestion.source === 'ai'"
    :show-customize-form="showIssueSelect"
    @toggle-customize-form="showIssueSelect = $event"
  >
    <template #item="suggestion"> <Issue v-bind="suggestion" /></template
    ><template #unknown-text>{{ $t("Numéro inconnu") }}</template>
    <template #customize-form>
      <IssueSelect
        @change="$event && createAndAcceptIssueSuggestion($event)" /></template
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
const { indexation } = storeToRefs(suggestionsStore);

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const createAndAcceptIssueSuggestion = async (data: {
  publicationcode: string;
  issuenumber: string;
  issuecode: string;
}) => {
  if (
    !indexation.value?.issueSuggestions.some(
      ({ issuecode }) => issuecode === data.issuecode,
    )
  ) {
    await createIssueSuggestion({
      ...data,
      source: "user",
    });
  }

  nextTick(() => {
    indexation.value!.acceptedIssueSuggestion =
      indexation.value!.issueSuggestions.find(
        ({ issuecode }) => issuecode === data.issuecode,
      )!;
    showIssueSelect.value = false;
  });
};

watch(
  () => indexation.value!.acceptedIssueSuggestion,
  (suggestion) => {
    indexationSocket.value!.services.acceptIssueSuggestion(
      suggestion?.id || null,
    );
  },
);
</script>
