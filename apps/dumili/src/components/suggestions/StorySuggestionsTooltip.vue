<template>
  <ai-tooltip
    :id="`ai-results-story-suggestions-${entry.id}`"
    :loading-events="[
      {
        eventName: 'reportCreateAiStorySuggestions',
        checkMatch: (id) => id === entry.id,
      },
      {
        eventName: 'reportRunOcrOnImage',
        checkMatch: (imageId) =>
          imageId === getEntryPages(indexation!, entry.id)[0].image?.id,
      },
    ]"
    :status="
      !firstPage.image
        ? 'failure'
        : entry.storySuggestions.length
          ? 'success'
          : 'idle'
    "
    @toggled="overlay = $event ? { type: 'ocr', entryId: entry.id } : undefined"
  >
    <template
      v-if="
        entry.acceptedStoryKind?.storyKindRows?.kind &&
        [STORY, COVER].includes(
          entry.acceptedStoryKind.storyKindRows.kind as typeof COVER | typeof STORY,
        )
      "
    >
      <template v-if="firstPageOcrResult">
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
          show-empty
          :empty-text="$t('Aucun texte détecté')"
        />
        <h4>{{ $t("Histoires potentielles") }}</h4>
        <template v-if="firstPageStorySearchResult">
          <b-table
            :fields="[
              { key: 'storycode', label: $t('Code histoire') },
              { key: 'title', label: $t('Titre') },
            ]"
            show-empty
            :empty-text="$t('Aucune histoire trouvée')"
            :items="
              firstPageStorySearchResult.stories
                .filter(
                  (
                    possibleStory
                  ): possibleStory is typeof possibleStory & {
                    aiStorySuggestion: {
                      storySuggestion: { storycode: string };
                    };
                  } => !!possibleStory.aiStorySuggestion?.storySuggestion
                )
                .map(
                  ({
                    aiStorySuggestion: {
                      storySuggestion: { storycode },
                    },
                  }) => ({
                    storycode,
                    title: storyDetails[storycode].title,
                  })
                )
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
        ><template v-else>{{ $t("Non calculé") }}</template></template
      >
      <template v-else-if="!firstPage.image">{{
        $t("Non calculé car la première page de l'entrée n'a pas d'image")
      }}</template>
      <template v-else>{{ $t("Non calculé") }}</template></template
    ><template v-else>{{
      $t(
        "Aucune suggestion car cette entrée n'est pas une histoire ni une couverture.",
      )
    }}</template></ai-tooltip
  >
</template>
<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type { FullEntry } from "~dumili-services/indexation";
import { COVER, STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

const { entry } = defineProps<{
  entry: FullEntry;
}>();

const { indexation } = storeToRefs(suggestions());
const { storyDetails } = storeToRefs(coa());

const { overlay } = storeToRefs(ui());

const firstPage = computed(() => getEntryPages(indexation.value!, entry.id)[0]);

const firstPageOcrResult = computed(() => firstPage.value.image?.aiOcrResult);
const firstPageStorySearchResult = computed(
  () => firstPage.value.image?.aiStorySearchResult,
);
</script>
