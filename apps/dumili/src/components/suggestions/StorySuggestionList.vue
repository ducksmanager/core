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
    :show-tooltips="!entry.includedInEntry"
  >
    <template #default="{ suggestion, location }">
      <StoryWithImage :storycode="suggestion.storycode">
        <span
          v-if="
            entry.acceptedStoryKind &&
            storyDetails[suggestion.storycode]?.originalstoryversioncode &&
            entry.acceptedStoryKind?.storyKindRows.kind !=
              storyversionDetails[
                storyDetails[suggestion.storycode].originalstoryversioncode!
              ]?.kind
          "
          :title="
            $t(
              'Le type de l\'histoire sélectionnée ne correspond pas au type de l\'entrée',
            )
          "
        >
          <i-bi-exclamation-triangle-fill
        /></span>
        <template
          v-if="
            storyDetails[suggestion.storycode] &&
            getStorycodePageCount(suggestion.storycode) &&
            getEntryPages(indexation, suggestion.entryId).length !==
              getStorycodePageCount(suggestion.storycode)
          "
        >
          <Teleport to="body">
            <b-popover
              lazy
              :target="`page-mismatch-${suggestion.storycode.replace(/[ \t]/g, '-')}-${location}`"
              interactive
              ><div>
                {{
                  $t(
                    "Cette histoire fait généralement {originalPagesCount} pages mais l'entrée de votre indexation en contient {entryPagesCount}.",
                    {
                      originalPagesCount: getStorycodePageCount(
                        suggestion.storycode,
                      ),
                      entryPagesCount: getEntryPages(
                        indexation,
                        suggestion.entryId,
                      ).length,
                    },
                  )
                }}
              </div>
              <b-button
                v-if="location === 'button'"
                class="mt-2"
                variant="success"
                size="sm"
                @click="
                  indexation.entries[entryIdx].entirepages =
                    getStorycodePageCount(suggestion.storycode)!
                "
                >{{
                  $t(
                    getStorycodePageCount(suggestion.storycode)! >
                      indexation.entries[entryIdx].entirepages
                      ? "Étendre cette entrée à {originalPagesCount} page|Étendre cette entrée à {originalPagesCount} pages"
                      : "Réduire cette entrée à {originalPagesCount} page|Réduire cette entrée à {originalPagesCount} pages",
                    {
                      originalPagesCount: getStorycodePageCount(
                        suggestion.storycode,
                      ),
                    },
                    getStorycodePageCount(suggestion.storycode)!,
                  )
                }}</b-button
              ></b-popover
            >
          </Teleport>
          <i-bi-exclamation-triangle-fill
            :id="`page-mismatch-${suggestion.storycode.replace(/[ \t]/g, '-')}-${location}`"
            class="mx-1"
        /></template>
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
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { suggestions } from "~/stores/suggestions";
import type { storySuggestion } from "~prisma/client_dumili/client";
import { getEntryPages } from "~dumili-utils/entryPages";

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

const getStorycodePageCount = (storycode: string) =>
  (storyDetails.value[storycode].originalstoryversioncode &&
    storyversionDetails.value[
      storyDetails.value[storycode].originalstoryversioncode
    ]?.entirepages) ||
  null;

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
