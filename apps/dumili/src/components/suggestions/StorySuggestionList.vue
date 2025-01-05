<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    class="position-absolute top-0 d-flex flex-column align-items-center w-100"
    :suggestions="entry.storySuggestions"
    :is-ai-source="(suggestion) => suggestion.ocrDetails !== null"
    :show-customize-form="showEntrySelect"
    @toggle-customize-form="showEntrySelect = $event"
  >
    <template #default="{ suggestion }">
      <Story :storycode="suggestion.storycode">
        <template #suffix>
          <span
            v-if="
                entry.acceptedStoryKind &&
                storyDetails[suggestion.storycode] &&
                entry.acceptedStoryKind?.kind !=
                storyversionDetails[storyDetails[suggestion.storycode].originalstoryversioncode!].kind
              "
            :title="
              $t(
                'Le type de l\'histoire sélectionnée ne correspond pas au type de l\'entrée',
              )
            "
          >
            <i-bi-exclamation-triangle-fill
          /></span>
          <span
            v-if="
                storyDetails[suggestion.storycode] &&
                getEntryPages(indexation!, suggestion.entryId).length !=
                storyversionDetails[storyDetails[suggestion.storycode].originalstoryversioncode!].entirepages
              "
            :title="
              $t(
                'Cette histoire fait généralement {originalPagesCount} pages mais l\'entrée de votre indexation en contient {entryPagesCount}',
                {
                  originalPagesCount: storyversionDetails[storyDetails[suggestion.storycode].originalstoryversioncode!].entirepages,
                  entryPagesCount: getEntryPages(indexation!, suggestion.entryId).length,
                },
              )
            "
          >
            <i-bi-exclamation-triangle-fill
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
import type { FullEntry } from "~dumili-services/indexation";
import { suggestions } from "~/stores/suggestions";
import type { storySuggestion } from "~prisma/client_dumili";
import { getEntryPages } from "~dumili-utils/entryPages";

const { t: $t } = useI18n();

const entry = defineModel<FullEntry>({
  required: true,
});

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { indexation } = storeToRefs(suggestions());

const showEntrySelect = ref(false);
const { storyDetails, storyversionDetails } = storeToRefs(coa());

const acceptStory = async (storycode: storySuggestion["storycode"] | null) => {
  let storySuggestion: Pick<storySuggestion, "id" | "storycode"> | undefined =
    entry.value.storySuggestions.find((s) => s.storycode === storycode);
  if (!storySuggestion && storycode) {
    const result = await indexationSocket.value!.services.createStorySuggestion(
      {
        entryId: entry.value.id,
        storycode,
        ai: false,
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
    await indexationSocket.value!.services.acceptStoryKindSuggestion(
      entry.value.id,
      correspondingStoryKindId,
    );
  }
};

watch(
  () => entry.value.acceptedStory?.storycode || null,
  async (storycode) => {
    acceptStory(storycode);
  },
);
</script>