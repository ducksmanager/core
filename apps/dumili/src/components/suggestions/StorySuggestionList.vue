<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    class="top-0 d-flex flex-column justify-content-center align-items-start w-100 h-100"
    :suggestions="entry.storySuggestions"
    :category="
      ({ aiStorySuggestionId, quackinatorSessionId }) =>
        aiStorySuggestionId !== null || quackinatorSessionId !== null
          ? 'ai'
          : 'user'
    "
    :item-link-classes="['h-100p']"
    :extra-button-class="['h-100p']"
    :show-tooltips="!entry.includedInEntry"
  >
    <template #default="{ suggestion, location }">
      <StoryWithImage :storycode="suggestion.storycode">
        <StoryKindMismatchHint :entry="entry" :suggestion="suggestion" />
        <StoryPageCountMismatchHint
          v-model="indexation.entries[entryIdx]"
          :suggestion="suggestion"
          :location="location"
        />
      </StoryWithImage>
    </template>
    <template #unknown-text>{{ $t("Contenu inconnu") }}</template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";

const { t: $t } = useI18n();

const entry = defineModel<FullEntry>({
  required: true,
});

const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;

const { storyDetails, storyversionDetails } = storeToRefs(coa());

const entryIdx = computed(() =>
  indexation.value.entries.findIndex((e) => e.id === entry.value.id),
);

watch(
  () => entry.value.acceptedStory?.storycode || null,
  (storycode) => {
    if (!storycode) {
      return;
    }
    const originalstoryversioncode =
      storyDetails.value[storycode]?.originalstoryversioncode;
    if (!originalstoryversioncode) {
      return;
    }
    const correspondingStoryKind = entry.value.storyKindSuggestions.find(
      ({ storyKindRows }) =>
        storyKindRows.kind ===
        storyversionDetails.value[originalstoryversioncode]?.kind,
    );
    if (correspondingStoryKind) {
      entry.value.acceptedStoryKind = correspondingStoryKind;
    }
  },
);
</script>
