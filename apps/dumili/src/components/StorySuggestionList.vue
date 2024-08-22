<template>
  <suggestion-list
    :suggestions="entry.storySuggestions"
    :is-ai-source="(suggestion) => suggestion.ocrDetailsId !== null"
    :current="acceptedEntry"
    :show-customize-form="showEntrySelect"
    @toggle-customize-form="showEntrySelect = $event"
    @select="acceptStorySuggestion($event!)"
  >
    <template #item="suggestion">
      <Story :suggestion="suggestion" />
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
import { FullIndexation } from "~dumili-services/indexations/types";
import type { entry, storySuggestion } from "~prisma/client_dumili";

const { t: $t } = useI18n();

const props = defineProps<{
  entry: FullIndexation["entries"][number];
}>();

const { entry } = toRefs(props);

const { getIndexationSocket } = inject(dumiliSocketInjectionKey)!;

const indexationSocket = computed(async () =>
  getIndexationSocket(entry.value.indexationId),
);

const showEntrySelect = ref(false);
const { acceptedStories } = storeToRefs(suggestions());

const acceptedEntry = computed(() => acceptedStories.value[entry.value.id]);

const addAndAcceptStoryversionToStorySuggestions = async (
  searchResult: SimpleStory,
) => {
  await (
    await indexationSocket.value
  ).services.createStorySuggestion({
    entryId: entry.value.id,
    storyversioncode: searchResult.storycode,
    acceptedOnEntries: {
      connect: { id: entry.value.id },
    },
  });
};

const acceptStorySuggestion = async (suggestion: storySuggestion) => {
  await (
    await indexationSocket.value
  ).services.acceptStorySuggestion(suggestion);
  showEntrySelect.value = false;
};
</script>
