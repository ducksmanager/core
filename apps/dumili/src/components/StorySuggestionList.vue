<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    :suggestions="entry.storySuggestions"
    :is-ai-source="(suggestion) => suggestion.ocrDetailsId !== null"
    :show-customize-form="showEntrySelect"
    @toggle-customize-form="showEntrySelect = $event"
  >
    <template #item="suggestion">
      <Story :story="suggestion">
        <template #suffix>
          <span
            title="Le type de l'histoire sélectionnée ne correspond pas au type de l'entrée"
          >
            <i-bi-exclamation-triangle-fill
              v-if="
                entry.acceptedStoryKind &&
                storyDetails[suggestion.storycode] &&
                entry.acceptedStoryKind?.kind !=
                storyversionDetails[storyDetails[suggestion.storycode].originalstoryversioncode!].kind
              "
              :id="`warning-story-kind-${suggestion.id}`"
          /></span>
        </template>
      </Story>
    </template>
    <template #unknown-text>{{ $t("Contenu inconnu") }}</template>
    <template #customize-text>{{ $t("Rechercher...") }}</template>
    <template #customize-form>
      <StorySearch @story-selected="createAndAcceptStorySuggestion" />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { SimpleStory } from "~dm-types/SimpleStory";
import { FullIndexation } from "~dumili-services/indexation/types";
import { suggestions } from "../stores/suggestions";

const { t: $t } = useI18n();

const entry = defineModel<FullIndexation["entries"][number]>({
  required: true,
});

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { loadIndexation } = suggestions();
const { indexation } = storeToRefs(suggestions());

const showEntrySelect = ref(false);
const { storyDetails, storyversionDetails } = storeToRefs(coa());

const createAndAcceptStorySuggestion = async (searchResult: SimpleStory) => {
  const result = await indexationSocket.value!.services.createStorySuggestion({
    entryId: entry.value.id,
    storycode: searchResult.storycode,
  });

  if (!("error" in result)) {
    await indexationSocket.value!.services.acceptStorySuggestion(
      result.createdStorySuggestion!.id || null,
    );
    await loadIndexation(indexation.value!.id);
  }
};
</script>
