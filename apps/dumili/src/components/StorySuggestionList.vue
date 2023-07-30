<template>
  <suggestion-list
    :suggestions="entrySuggestions"
    :get-current="() => acceptedEntry"
    :show-customize-form="showEntrySelect"
    @show-customize-form="showEntrySelect = $event"
    @select="
      acceptEntrySuggestion(
        ($event as EntrySuggestion | undefined)?.storyversion?.storycode ||
          undefined
      )
    "
  >
    <template #item="suggestion: EntrySuggestion">
      {{ suggestion.storyversion?.storycode }}
    </template>
    <template #unknown>Contenu inconnu</template>
    <template #customize-form>
      <StorySearch @story-selected="addCustomEntrycodeToEntrySuggestions" />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { EntrySuggestion, issueDetails } from "~/stores/issueDetails";

const props = defineProps<{
  entryurl: string;
}>();

const showEntrySelect = ref(false);
const issueDetailsStore = issueDetails();

const acceptedEntry = computed(
  () => issueDetailsStore.acceptedEntries[props.entryurl]
);
const entrySuggestions = computed(() =>
  issueDetailsStore.entrySuggestions[props.entryurl].filter(
    ({ storyversion }) =>
      storyversion?.kind === acceptedEntry.value?.storyversion?.kind
  )
);

const addCustomEntrycodeToEntrySuggestions = ({
  storycode,
  title,
}: {
  storycode: string;
  title: string;
}) => {
  if (storycode) {
    const userSuggestion: EntrySuggestion = {
      title,
      storyversion: {
        storycode,
      },
      isAccepted: true,
      type: "user",
    };
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
  issueDetailsStore.acceptEntrySuggestion(props.entryurl, storycode);
  showEntrySelect.value = false;
};
</script>
