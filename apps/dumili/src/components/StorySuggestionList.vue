<template>
  <suggestion-list
    :suggestions="entrySuggestions"
    :get-current="() => acceptedEntry"
    :show-customize-form="showEntrySelect"
    allow-customize-form
    @toggle-customize-form="showEntrySelect = $event"
    @select="
      acceptEntrySuggestion(
        ($event as EntrySuggestion | undefined)?.data?.storyversion
          ?.storycode || undefined
      )
    "
  >
    <template #item="suggestion: EntrySuggestion">
      <Story :entry="suggestion.data" />
    </template>
    <template #unknown>Contenu inconnu</template>
    <template #customize-form>
      <StorySearch @story-selected="addCustomEntrycodeToEntrySuggestions" />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { EntrySuggestion, suggestions } from "~/stores/suggestions";

const props = defineProps<{
  entryurl: string;
}>();

const showEntrySelect = ref(false);
const suggestionsStore = suggestions();

const acceptedEntry = computed(
  () => suggestionsStore.acceptedEntries[props.entryurl]
);
const entrySuggestions = computed(
  () => suggestionsStore.entrySuggestions[props.entryurl]
);

const addCustomEntrycodeToEntrySuggestions = ({
  storycode,
  title,
}: {
  storycode: string;
  title: string;
}) => {
  if (storycode) {
    const userSuggestion = new EntrySuggestion(
      {
        title,
        storyversion: {
          storycode,
        },
      },
      { source: "user", isAccepted: true }
    );
    suggestionsStore.entrySuggestions[props.entryurl] = [
      ...suggestionsStore.entrySuggestions[props.entryurl].filter(
        ({ meta }) => meta.source === "ai"
      ),
      userSuggestion,
    ];
    acceptEntrySuggestion(storycode);
  }
};

const acceptEntrySuggestion = (storycode?: string) => {
  suggestionsStore.acceptSuggestion(
    suggestionsStore.entrySuggestions[props.entryurl],
    (suggestion) => suggestion.data.storyversion?.storycode === storycode
  );
  showEntrySelect.value = false;
};
</script>
