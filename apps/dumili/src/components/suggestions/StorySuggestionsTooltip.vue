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
        checkMatch: (imageId) => imageId === firstPage.image?.id,
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
        >
          <template #cell(confidence)="row">
            {{ parseInt((row.item!.confidence * 100).toFixed()) }}%
          </template>
        </b-table>
      </template>
      <template v-if="firstPageStorySearchResult">
        <h4>{{ $t("Résultats de la recherche par image") }}</h4>
        <b-table
          :fields="[
            {
              key: 'score',
              label: $t('Score'),
            },
            { key: 'storycode', label: $t('Code histoire') },
            { key: 'title', label: $t('Titre') },
          ]"
          show-empty
          :empty-text="$t('Aucune histoire trouvée')"
          :items="suggestedStories"
        >
          <template #cell(score)="row">
            {{ row.item!.aiStorySuggestion!.aiStorySearchPossibleStory!.score.toFixed(2) }}
          </template>
          <template #cell(storycode)="row">
            <inducks-link
              :storycode="row.item!.storycode"
              show-code
            /> </template
          ><template #cell(title)="row">
            <div class="d-flex flex-column align-items-center">
              <div>
                {{ row.item!.storycode in storyDetails ? storyDetails[row.item!.storycode].title : row.item!.storycode }}
              </div>
              <img
                :src="inducksCoverRoot.replace('f_auto', 'c_crop,h_0.5,x_0,w_1') + storyUrls[row.item!.storycode]"
              />
            </div>
          </template> </b-table
      ></template>
      <template v-if="!firstPage.image">{{
        $t("Non calculé car la première page de l'entrée n'a pas d'image")
      }}</template>
      <template
        v-else-if="!firstPageOcrResult && !firstPageStorySearchResult"
        >{{ $t("Non calculé") }}</template
      ></template
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
  entry: Pick<FullEntry, "id" | "storySuggestions" | "acceptedStoryKind">;
}>();

const { indexation } = storeToRefs(suggestions());
const { storyUrls, storyDetails } = storeToRefs(coa());
const { fetchStoryDetails } = coa();

const { overlay } = storeToRefs(ui());

const firstPage = computed(() => getEntryPages(indexation.value!, entry.id)[0]);

const firstPageOcrResult = computed(() => firstPage.value.image?.aiOcrResult);
const firstPageStorySearchResult = computed(
  () => firstPage.value.image?.aiStorySearchResult,
);

const inducksCoverRoot = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/image/upload/f_auto/inducks-covers/`;

const suggestedStories = computed(() =>
  firstPageStorySearchResult.value?.stories
    .map((possibleStory) =>
      entry.storySuggestions.find(
        ({ aiStorySuggestionId }) =>
          aiStorySuggestionId === possibleStory.aiStorySuggestion?.id,
      ),
    )
    .filter(
      (
        possibleStory,
      ): possibleStory is typeof possibleStory & { storycode: string } =>
        !!possibleStory,
    ),
);

watch(
  suggestedStories,
  (value) => {
    const storycodes = value?.map(({ storycode }) => storycode);
    if (storycodes) {
      fetchStoryDetails(storycodes);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
:deep(.inducks-link) {
  img {
    filter: brightness(0) invert(1);
    margin-left: 0.5em;
  }
}
</style>