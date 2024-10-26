<template>
  <suggestion-list
    v-model="acceptedStory"
    :suggestions="entry.storySuggestions"
    :is-ai-source="(suggestion) => suggestion.ocrDetailsId !== null"
    :show-customize-form="showEntrySelect"
    @toggle-customize-form="showEntrySelect = $event"
  >
    <template #item="suggestion">
      <Story :story="suggestion" />
    </template>
    <template #unknown-text>{{ $t("Contenu inconnu") }}</template>
    <template #customize-text>{{ $t("Rechercher...") }}</template>
    <template #customize-form>
      <StorySearch
        @story-selected="addAndAcceptStoryversionToStorySuggestions"
      />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import { SimpleStory } from "~dm-types/SimpleStory";
import { FullIndexation } from "~dumili-services/indexation/types";

const { t: $t } = useI18n();

const entry = defineModel<FullIndexation["entries"][number]>({
  required: true,
});

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const showEntrySelect = ref(false);
const { acceptedStories } = storeToRefs(suggestions());

const acceptedStory = computed(() => acceptedStories.value[entry.value.id]);

const addAndAcceptStoryversionToStorySuggestions = async (
  searchResult: SimpleStory,
) => {
  await indexationSocket.value!.services.createStorySuggestion({
    entryId: entry.value.id,
    storyversioncode: searchResult.storycode,
    acceptedOnEntries: {
      connect: { id: entry.value.id },
    },
  });
};

watch(
  () => entry.value.acceptedSuggestedStory,
  (storySuggestion) => {
    indexationSocket.value!.services.acceptStorySuggestion(
      storySuggestion?.id || null,
    );
  },
);
</script>
