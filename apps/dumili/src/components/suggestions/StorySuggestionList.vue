<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    v-model:show-customize-form="showEntrySelect"
    class="top-0 d-flex flex-column justify-content-center align-items-start w-100 h-100"
    :suggestions="entry.storySuggestions"
    :category="
      ({ aiStorySuggestionId }) =>
        aiStorySuggestionId !== null ? 'ai' : 'user'
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
    <template #customize-text
      ><span>{{ $t("Rechercher...") }}</span></template
    >
    <template #customize-form>
      <StorySearch
        :kind="entry.acceptedStoryKind?.storyKindRows.kind"
        @story-selected="
          acceptStory($event);
          showEntrySelect = false;
        "
      />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import type { storySuggestion } from "~prisma/client_dumili/client";

const { t: $t } = useI18n();

const entry = defineModel<FullEntry>({
  required: true,
});

const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;

const showEntrySelect = ref(false);
const { storyDetails, storyversionDetails } = storeToRefs(coa());

const entryIdx = computed(() =>
  indexation.value.entries.findIndex((e) => e.id === entry.value.id),
);

const acceptStory = (storycode: storySuggestion["storycode"] | null) => {
  if (!storycode) {
    entry.value.acceptedStory = null;
    return;
  }
  const storySuggestion = entry.value.storySuggestions.find(
    (s) => s.storycode === storycode,
  );
  entry.value.acceptedStory = storySuggestion ?? {
    id: 0,
    storycode,
    entryId: entry.value.id,
    aiStorySuggestionId: null,
  };
};

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
