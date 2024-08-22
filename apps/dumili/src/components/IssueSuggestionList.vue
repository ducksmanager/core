<template>
  <suggestion-list
    :suggestions="indexation!.issueSuggestions"
    :is-ai-source="(suggestion) => suggestion.source === 'ai'"
    :current="issue!"
    :show-customize-form="showIssueSelect"
    @toggle-customize-form="showIssueSelect = $event"
    @select="$event && acceptIssueSuggestion($event, $event.source)"
  >
    <template #item="suggestion: issueSuggestion">
      <Issue v-bind="suggestion" /></template
    ><template #unknown-text>{{ $t("Numéro inconnu") }}</template>
    <template #customize-form>
      <IssueSelect
        @change="$event && acceptIssueSuggestion($event, 'user')" /></template
    ><template #customize-text> {{ $t("Sélectionner...") }}</template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";

const { t: $t } = useI18n();

const showIssueSelect = ref(false);
const suggestionsStore = suggestions();
const { indexation } = storeToRefs(suggestionsStore);

import { issueSuggestion } from "~prisma/client_dumili";

const { getIndexationSocket } = inject(dumiliSocketInjectionKey)!;

const issue = computed(() => suggestionsStore.acceptedIssue);

const acceptIssueSuggestion = async (
  {
    publicationcode,
    issuenumber,
  }: {
    publicationcode: string | null;
    issuenumber: string | null;
  },
  source: issueSuggestion["source"],
) => {
  if (publicationcode && issuenumber) {
    await getIndexationSocket(
      indexation.value!.id,
    ).services.acceptIssueSuggestion({
      source,
      indexationId: indexation.value!.id,
      publicationcode,
      issuenumber,
    });
  }
  showIssueSelect.value = false;
};
</script>
