<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    class="position-absolute top-0 d-flex flex-column align-items-center w-100"
    :suggestions="entry.storySuggestions"
    :is-ai-source="(suggestion) => suggestion.ocrDetails !== null"
    :show-customize-form="showEntrySelect"
    @toggle-customize-form="showEntrySelect = $event"
  >
    <template #default="{ suggestion, location }">
      <b-img
        v-if="storyUrls[suggestion.storycode]"
        style="height: 100px"
        :src="
          inducksCoverRoot.replace('f_auto', 'c_crop,h_0.5,x_0,w_1') +
          storyUrls[suggestion.storycode]
        "
      />
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
                      getStorycodePageCount(suggestion.storycode)
                  "
                  >{{
                    $t(
                      getStorycodePageCount(suggestion.storycode) >
                        indexation.entries[entryIdx].entirepages
                        ? "Étendre cette entrée à {originalPagesCount} page|Étendre cette entrée à {originalPagesCount} pages"
                        : "Réduire cette entrée à {originalPagesCount} page|Réduire cette entrée à {originalPagesCount} pages",
                      {
                        originalPagesCount: getStorycodePageCount(
                          suggestion.storycode,
                        ),
                      },
                      getStorycodePageCount(suggestion.storycode),
                    )
                  }}</b-button
                ></b-popover
              >
            </Teleport>
            <i-bi-exclamation-triangle-fill
              :id="`page-mismatch-${suggestion.storycode.replace(/[ \t]/g, '-')}-${location}`"
              class="mx-1"
          /></template>
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
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { suggestions } from "~/stores/suggestions";
import type { storySuggestion } from "~prisma/client_dumili";
import { getEntryPages } from "~dumili-utils/entryPages";

const { t: $t } = useI18n();

const entry = defineModel<FullEntry>({
  required: true,
});

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { storyUrls } = storeToRefs(coa());

const showEntrySelect = ref(false);
const { storyDetails, storyversionDetails } = storeToRefs(coa());

const inducksCoverRoot = import.meta.env.VITE_CLOUDINARY_COVERS_ROOT!;

const entryIdx = computed(() =>
  indexation.value.entries.findIndex((e) => e.id === entry.value.id),
);

const getStorycodePageCount = (storycode: string) =>
  storyversionDetails.value[
    storyDetails.value[storycode].originalstoryversioncode!
  ].entirepages!;

const acceptStory = async (storycode: storySuggestion["storycode"] | null) => {
  let storySuggestion: Pick<storySuggestion, "id" | "storycode"> | undefined =
    entry.value.storySuggestions.find((s) => s.storycode === storycode);
  if (!storySuggestion && storycode) {
    const result = await indexationSocket.value!.events.createStorySuggestion({
      entryId: entry.value.id,
      storycode,
      ai: false,
    });
    storySuggestion = result.createdStorySuggestion;
  }
  await indexationSocket.value!.events.acceptStorySuggestion(
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
    await indexationSocket.value!.events.acceptStoryKindSuggestion(
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