<template>
  <suggestion-list
    v-model="indexation!.acceptedIssueSuggestion"
    class="position-static"
    :suggestions="indexation!.issueSuggestions"
    :is-ai-source="(suggestion) => suggestion.ai !== null"
    :show-customize-form="showIssueSelect"
    @toggle-customize-form="showIssueSelect = $event"
  >
    <template #default="{ suggestion }"> <Issue :issue="suggestion" /></template
    ><template #unknown-text>{{ $t("Numéro inconnu") }}</template>
    <template #customize-form>
      <issue-select
        @change="
          $event &&
          createAndAcceptIssueSuggestion({
            publicationcode: $event.publicationcode,
            issuenumber: $event.issuenumber,
          })
        " /></template
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

const { indexationSocket } = injectLocal(dumiliSocketInjectionKey)!;

const createAndAcceptIssueSuggestion = async (data: {
  publicationcode: string;
  issuenumber: string;
}) => {
  if (
    !indexation.value?.issueSuggestions.some(
      ({ publicationcode, issuenumber }) =>
        publicationcode === data.publicationcode &&
        issuenumber === data.issuenumber,
    )
  ) {
    await createIssueSuggestion(data);
  }

  nextTick(() => {
    indexation.value!.acceptedIssueSuggestion =
      indexation.value!.issueSuggestions.find(
        ({ publicationcode, issuenumber }) =>
          publicationcode === data.publicationcode &&
          issuenumber === data.issuenumber,
      )!;
    showIssueSelect.value = false;
  });
};

watch(
  () => indexation.value?.acceptedIssueSuggestion?.id,
  (suggestionId) => {
    indexationSocket.value!.acceptIssueSuggestion(suggestionId || null);
  },
);
</script>
