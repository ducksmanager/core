<template>
  <ai-tooltip
    :id="`ai-results-story-suggestions-${entry.id}`"
    :loading-events="[
      {
        eventName: 'createAiStorySuggestions',
        checkMatch: (id) => id === entry.id,
      },
    ]"
    :status="entry.storySuggestions.length ? 'success' : 'idle'"
    @toggled="
      showAiDetectionsOn = $event ? { type: 'entry', id: entry.id } : undefined
    "
  >
    <template v-if="entry.acceptedStoryKind?.kind === STORY">
      <template v-if="firstPageOcrResult">
        <template v-if="entry.storySuggestions.length">
          {{ $t("Résultats OCR pour la première case:") }}
          <table-results :data="firstPageOcrResult.matches" />
          {{ $t("Histoires potentielles:") }}
          <table-results
            :data="
                entry.storySuggestions.filter(({ai}) => ai).map(({ storycode }) => ({
                  storycode,
                  title: storyDetails[storycode!].title,
                }))
              " /></template
      ></template>
      <template v-else>{{ $t("Non calculé") }}</template></template
    ><template v-else>{{
      $t("Aucune suggestion car cette entrée n'est pas une histoire.")
    }}</template></ai-tooltip
  >
</template>
<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type { FullEntry } from "~dumili-services/indexation/types";
import { STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

const { entry } = defineProps<{
  entry: FullEntry;
}>();

const { indexation } = storeToRefs(suggestions());
const { storyDetails } = storeToRefs(coa());

const { showAiDetectionsOn } = storeToRefs(ui());

const firstPageOcrResult = computed(
  () => getEntryPages(indexation.value!, entry.id)[0].image?.aiOcrResult,
);
</script>