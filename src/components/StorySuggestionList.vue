<template>
  <suggestion-list
    :suggestions="entrySuggestions"
    :get-current="() => acceptedEntry"
    :show-customize-form="showEntrySelect"
    allow-customize-form
    @show-customize-form="showEntrySelect = $event"
    @select="
      acceptEntrySuggestion(
        ($event as EntrySuggestion | undefined)?.data?.storyversion
          ?.storycode || undefined
      )
    "
  >
    <template #item="suggestion: EntrySuggestion">
      {{ suggestion.data.storyversion?.storycode }}
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
const issueDetailsStore = suggestions();

const acceptedEntry = computed(
  () => issueDetailsStore.acceptedEntries[props.entryurl]
);
const entrySuggestions = computed(
  () => issueDetailsStore.entrySuggestions[props.entryurl]
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
      { type: "ai", isAccepted: true }
    );
    issueDetailsStore.entrySuggestions[props.entryurl] = [
      ...issueDetailsStore.entrySuggestions[props.entryurl].filter(
        ({ type }) => type === "ai"
      ),
      userSuggestion,
    ];
    acceptEntrySuggestion(storycode);
  }
};

const acceptEntrySuggestion = (storycode?: string) => {
  issueDetailsStore.acceptSuggestion(
    issueDetailsStore.entrySuggestions[props.entryurl],
    (suggestion) => suggestion.data.storyversion?.storycode === storycode
  );
  showEntrySelect.value = false;
};
</script>
