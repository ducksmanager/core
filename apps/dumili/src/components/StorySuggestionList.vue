<template>
  <suggestion-list
    :suggestions="entrySuggestions"
    :get-current="() => acceptedEntry"
    :show-customize-form="showEntrySelect"
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
    <template #unknown-text>{{ $t("Contenu inconnu") }}</template>
    <template #customize-text>{{ $t("Rechercher...") }}</template>
    <template #customize-form>
      <StorySearch @story-selected="addCustomEntrycodeToEntrySuggestions" />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { suggestions } from "~/stores/suggestions";
import { EntrySuggestion } from "~dumili-types/suggestions";

const { t: $t } = useI18n();

const props = defineProps<{
  entryurl: string;
}>();

const showEntrySelect = ref(false);
const { acceptSuggestion } = suggestions();
const { acceptedEntries, entrySuggestions: allEntrySuggestions } = storeToRefs(
  suggestions()
);

const acceptedEntry = computed(() => acceptedEntries.value[props.entryurl]);
const entryIndex = computed(() =>
  allEntrySuggestions.value.findIndex(({ url }) => url === props.entryurl)
);
const entrySuggestions = computed(
  () =>
    allEntrySuggestions.value[entryIndex.value].suggestions.filter(
      (suggestion) => suggestion !== undefined
    ) as EntrySuggestion[]
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
    allEntrySuggestions.value[entryIndex.value].suggestions = [
      ...entrySuggestions.value.filter(({ meta }) => meta.source === "ai"),
      userSuggestion,
    ];
    acceptEntrySuggestion(storycode);
  }
};

const acceptEntrySuggestion = (storycode?: string) => {
  acceptSuggestion(
    entrySuggestions.value,
    (suggestion) => suggestion.data.storyversion?.storycode === storycode
  );
  showEntrySelect.value = false;
};
</script>
