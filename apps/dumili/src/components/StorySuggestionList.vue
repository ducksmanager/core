<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    :suggestions="entry.storySuggestions"
    :is-ai-source="(suggestion) => suggestion.ocrDetailsId !== null"
    :show-customize-form="showEntrySelect"
    @toggle-customize-form="showEntrySelect = $event"
  >
    <template #item="suggestion">
      <Story :storycode="suggestion.storycode">
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
      <StorySearch @story-selected="acceptStory($event.storycode)" />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { FullIndexation } from "~dumili-services/indexation/types";
import { suggestions } from "../stores/suggestions";
import { storySuggestion } from "~prisma/client_dumili";

const { t: $t } = useI18n();

const entry = defineModel<FullIndexation["entries"][number]>({
  required: true,
});

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { loadIndexation } = suggestions();
const { indexation } = storeToRefs(suggestions());

const showEntrySelect = ref(false);
const { storyDetails, storyversionDetails } = storeToRefs(coa());

const acceptStory = async (storycode: storySuggestion["storycode"] | null) => {
  let storySuggestion = entry.value.storySuggestions.find(
    (s) => s.storycode === storycode,
  );
  if (!storySuggestion && storycode) {
    const result = await indexationSocket.value!.services.createStorySuggestion(
      {
        entryId: entry.value.id,
        storycode,
      },
    );
    storySuggestion = result.createdStorySuggestion;
  }
  await indexationSocket.value!.services.acceptStorySuggestion(
    entry.value.id,
    storySuggestion?.id || null,
  );
  if (storySuggestion?.id) {
    const correspondingStoryKindId = entry.value.storyKindSuggestions.find(
      ({ kind }) =>
        kind ===
        storyversionDetails.value[
          storyDetails.value[storySuggestion.storycode]
            .originalstoryversioncode!
        ].kind,
    )!.id;
    indexationSocket.value!.services.acceptStoryKindSuggestion(
      entry.value.id,
      correspondingStoryKindId,
    );
  }
  await loadIndexation(indexation.value!.id);
};

watch(
  () => entry.value.acceptedStory?.storycode || null,
  async (storycode) => {
    acceptStory(storycode);
  },
);
</script>
