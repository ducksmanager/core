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
      <template v-if="firstPageImage?.aiStorySearchResult">
        <h4>{{ $t("Résultats de la recherche par image") }}</h4>
        <b-table
          :fields="[
            { key: 'storycode', label: $t('Code histoire') },
            { key: 'title', label: $t('Titre') },
          ]"
          show-empty
          :empty-text="$t('Aucune histoire trouvée')"
          :items="suggestedStories.aiStorySearchResult"
        >
          <template #cell(storycode)="row">
            <inducks-link
              :storycode="row.item.storycode"
              show-code
            /> </template
          ><template #cell(title)="row">
            <div
              v-if="row.item.storycode in storyDetails"
              class="d-flex flex-column align-items-center"
            >
              <div>
                {{ storyDetails[row.item.storycode].title }}
              </div>
              <img
                :src="
                  inducksCoverRoot.replace('f_auto', 'c_crop,h_0.5,x_0,w_1') +
                  storyUrls[row.item.storycode]
                "
              />
            </div>
          </template> </b-table
      ></template>
      <template v-if="firstPageImage?.aiOcrResult">
        <h4>{{ $t("Textes détectés dans la première case") }}</h4>
        <b-row>
          <b-col cols="6">
            <b-table
              :fields="[
                { key: 'text', label: $t('Texte') },
                { key: 'x1' },
                { key: 'x2' },
                { key: 'y1' },
                { key: 'y2' },
                { key: 'confidence', label: $t('Confiance') },
              ]"
              :items="firstPageImage?.aiOcrResult?.matches"
              show-empty
              :empty-text="$t('Aucun texte détecté')"
            >
              <template #cell(confidence)="row">
                {{ parseInt((row.item.confidence * 100).toFixed()) }}%
              </template>
            </b-table></b-col
          >
          <b-col cols="6">
            <b-table
              :fields="[
                { key: 'storycode', label: $t('Code histoire') },
                { key: 'title', label: $t('Titre') },
              ]"
              show-empty
              :empty-text="$t('Aucune histoire trouvée')"
              :items="suggestedStories.aiOcrResult"
            >
              <template #cell(storycode)="row">
                <inducks-link
                  :storycode="row.item.storycode"
                  show-code
                /> </template
              ><template #cell(title)="row">
                <div
                  v-if="row.item.storycode in storyDetails"
                  class="d-flex flex-column align-items-center"
                >
                  <div>
                    {{ storyDetails[row.item.storycode].title }}
                  </div>
                  <img
                    :src="
                      inducksCoverRoot.replace(
                        'f_auto',
                        'c_crop,h_0.5,x_0,w_1',
                      ) + storyUrls[row.item.storycode]
                    "
                  />
                </div>
              </template> </b-table
          ></b-col>
        </b-row>
      </template>
      <template v-if="!firstPage.image">{{
        $t("Non calculé car la première page de l'entrée n'a pas d'image")
      }}</template>
      <template
        v-else-if="
          !firstPageImage?.aiOcrResult && !firstPageImage?.aiStorySearchResult
        "
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
import "~group-by";

const { entry } = defineProps<{
  entry: Pick<FullEntry, "id" | "storySuggestions" | "acceptedStoryKind">;
}>();

const { indexation } = storeToRefs(suggestions());
const { storyUrls, storyDetails } = storeToRefs(coa());
const { fetchStoryDetails } = coa();

const { overlay } = storeToRefs(ui());

const firstPage = computed(() => getEntryPages(indexation.value!, entry.id)[0]);

const firstPageImage = computed(() => firstPage.value.image);

const liveEntry = computed(() =>
  indexation.value?.entries.find(({ id }) => id === entry.id),
);

const inducksCoverRoot = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/image/upload/f_auto/inducks-covers/`;

const suggestedStories = computed(() =>
  (["aiOcrResult", "aiStorySearchResult"] as const)
    .map((source) => ({ source }))
    .groupBy("source", null, ({ source }) =>
      (firstPageImage.value?.[source]?.stories ?? []).map((possibleStory) =>
        (liveEntry.value?.storySuggestions ?? []).find(
          ({ aiStorySuggestionId }) =>
            aiStorySuggestionId === possibleStory.aiStorySuggestion?.id,
        )!,
      ),
    ),
);

watch(
  suggestedStories,
  (value) => {
    const storycodes = new Set([
      ...value.aiOcrResult.map((story) => story.storycode),
      ...value.aiStorySearchResult.map((story) => story.storycode),
    ]);
    if (storycodes.size) {
      fetchStoryDetails(Array.from(storycodes));
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