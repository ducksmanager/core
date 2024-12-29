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
          <h4>{{ $t("Résultats OCR pour la première case") }}</h4>
          <b-table
            :fields="[
              { key: 'text', label: $t('Texte') },
              { key: 'x1' },
              { key: 'x2' },
              { key: 'y1' },
              { key: 'y2' },
              { key: 'confidence', label: $t('Confiance') },
            ]"
            :items="firstPageOcrResult.matches"
            ><template #empty>{{ $t("Aucun texte détecté") }}</template>
          </b-table>
          <h4>{{ $t("Histoires potentielles") }}</h4>
          <b-table
            :fields="[
              { key: 'storycode', label: $t('Code histoire') },
              { key: 'title', label: $t('Titre') },
            ]"
            :items="
                entry.storySuggestions.filter(({ai}) => ai).map(({ storycode }) => ({
                  storycode,
                  title: storyDetails[storycode!].title,
                }))
              "
          >
            <template #cell(storycode)="row">
              <a
                class="text-nowrap"
                :href="`https://inducks.org/story.php?c=${encodeURIComponent(row.item.storycode)}`"
                target="_blank"
                >{{ row.item.storycode }}</a
              ></template
            ></b-table
          ></template
        ></template
      >
      <template v-else-if="!firstPage.image">{{
        $t("Non calculé car la première page de l'entrée n'a pas d'image")
      }}</template>
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

const firstPage = computed(() => getEntryPages(indexation.value!, entry.id)[0]);

const firstPageOcrResult = computed(() => firstPage.value.image?.aiOcrResult);
</script>