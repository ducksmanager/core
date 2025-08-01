<template>
  <suggestion-list
    v-model="entry.acceptedStory"
    class="position-absolute top-0 d-flex flex-column justify-content-center align-items-center w-100 h-100"
    :suggestions="entry.storySuggestions"
    :is-ai-source="({ aiStorySuggestionId }) => aiStorySuggestionId !== null"
    :show-customize-form="showEntrySelect"
    :extra-menu-class="['w-150', 'start-m50']"
    @toggle-customize-form="showEntrySelect = $event"
  >
    <template #default="{ suggestion, location }">
      <b-row class="w-100" style="height: 100px">
        <b-col
          cols="6"
          class="d-flex justify-content-center story-first-page"
          :style="{
            backgroundImage: `url(${inducksCoverRoot.replace('f_auto', 'c_crop,h_0.5,x_0,w_1') + storyUrls[suggestion.storycode]})`,
          }"
          @mousemove="handleImageMouseMove"
          @mouseleave="handleImageLeave"
        >
        </b-col>
        <b-col
          cols="6"
          class="d-flex flex-column justify-content-center text-wrap"
        >
          <Story :storycode="suggestion.storycode">
            <template #suffix>
              <span
                v-if="
                entry.acceptedStoryKind &&
                storyDetails[suggestion.storycode]?.originalstoryversioncode &&
                entry.acceptedStoryKind?.storyKindRows.kind !=
                storyversionDetails[storyDetails[suggestion.storycode].originalstoryversioncode!]?.kind
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
            </template>
          </Story>
        </b-col>
      </b-row>
    </template>
    <template #unknown-text>{{ $t("Contenu inconnu") }}</template>
    <template #customize-text
      ><span>{{ $t("Rechercher...") }}</span></template
    >
    <template #customize-form>
      <StorySearch
        :kind="entry.acceptedStoryKind?.storyKindRows.kind"
        @story-selected="
          acceptStory($event.storycode);
          showEntrySelect = false;
        "
      />
    </template>
  </suggestion-list>
</template>

<script lang="ts" setup>
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { suggestions } from "~/stores/suggestions";
import type { storySuggestion } from "~prisma/client_dumili/client";
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

const inducksCoverRoot = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/image/upload/f_auto/inducks-covers/`;

const entryIdx = computed(() =>
  indexation.value.entries.findIndex((e) => e.id === entry.value.id),
);

const getStorycodePageCount = (storycode: string) =>
  (storyDetails.value[storycode].originalstoryversioncode &&
    storyversionDetails.value[
      storyDetails.value[storycode].originalstoryversioncode
    ]?.entirepages) ||
  null;

const acceptStory = async (storycode: storySuggestion["storycode"] | null) => {
  let storySuggestion: Pick<storySuggestion, "id" | "storycode"> | undefined =
    entry.value.storySuggestions.find((s) => s.storycode === storycode);
  if (!storySuggestion && storycode) {
    const result = await indexationSocket.value!.createStorySuggestion({
      entryId: entry.value.id,
      storycode,
    });
    storySuggestion = result.createdStorySuggestion;
  }
  await indexationSocket.value!.acceptStorySuggestion(
    entry.value.id,
    storySuggestion?.id || null,
  );
  if (storySuggestion?.id) {
    const correspondingStoryKindId = entry.value.storyKindSuggestions.find(
      ({ storyKindRows }) =>
        storyKindRows.kind ===
        storyversionDetails.value[
          storyDetails.value[storySuggestion.storycode]
            .originalstoryversioncode!
        ].kind,
    )!.id;
    await indexationSocket.value!.acceptStoryKindSuggestion(
      entry.value.id,
      correspondingStoryKindId,
    );
  }
};

const handleImageMouseMove = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  const elementHeight = rect.height;

  // Calculate percentage from top (0 = top, 1 = bottom)
  const percentage = Math.max(0, Math.min(1, mouseY / elementHeight));

  // Convert percentage to background position (0% = top, 100% = bottom)
  const backgroundPosition = `center ${percentage * 100}%`;
  target.style.backgroundPosition = backgroundPosition;
};

const handleImageLeave = (event: Event) => {
  const target = event.target as HTMLElement;
  target.style.backgroundPosition = "top center";
};

watch(
  () => entry.value.acceptedStory?.storycode || null,
  (storycode) => {
    acceptStory(storycode);
  },
);
</script>

<style scoped lang="scss">
.story-first-page {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: top center;
}
</style>