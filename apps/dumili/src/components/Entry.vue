<template>
  <b-row class="d-flex w-100 align-items-center">
    <template v-if="editable">
      <b-col col cols="3">
        <suggestion-list
          v-model="entry.acceptedStoryKind"
          :suggestions="entry.storyKindSuggestions"
          :is-ai-source="(suggestion) => suggestion.isChosenByAi"
          :item-class="(suggestion) => [`kind-${suggestion.kind}`]"
        >
          <template #item="suggestion">
            {{ getStoryKind(suggestion.kind) }}
          </template>
          <template #unknown-text>{{
            $t("Type inconnu")
          }}</template></suggestion-list
        ><ai-tooltip
          :id="`ai-results-entry-story-kind-${entry.id}`"
          :disabled="!storyKindAiSuggestion"
          @click="showAiDetectionsOn = entry.id"
          @re-run="runKumiko(entry.id)"
        >
          <b>Inferred page story kinds</b>
          <table-results
            :data="
              pagesWithInferredKinds.map(({ page, ...inferredData }) => ({
                page: page.pageNumber,
                ...inferredData,
              }))
            "
          /><br />
          <b>Inferred entry story kind</b>
          {{
            storyKinds.find(({ code }) => code === storyKindAiSuggestion?.kind)
              ?.label
          }}</ai-tooltip
        ></b-col
      ><b-col col cols="9" class="flex-column"
        ><div class="d-flex flex-row align-items-center">
          <StorySuggestionList v-model="entry" />
          <ai-tooltip
            :id="`ai-results-entry-story-${entry.id}`"
            :disabled="!storyAiSuggestions.length"
            @click="showAiDetectionsOn = entry.id"
            @re-run="runStorycodeOcr(entry.id)"
          >
            <template v-if="storyAiSuggestions.length">
              OCR results:
              <table-results :data="pages[0].aiOcrResults" />
              Potential stories:
              <table-results
                :data="
                  storyAiSuggestions.map(({ storycode }) => ({
                    storycode,
                    title: storyDetails[storycode].title,
                  }))
                " /></template
            ><template v-else>No OCR results</template></ai-tooltip
          >
        </div>
        <b-form-input
          placeholder="Titre de l'histoire"
          type="text"
          class="w-100"
          :value="entry.title || ''"
      /></b-col>
    </template>
    <template v-else>
      <b-col col cols="3">
        <b-badge
          size="xl"
          :class="{ [`kind-${entry.acceptedStoryKind?.kind}`]: true }"
          >{{
            (entry.acceptedStoryKind &&
              getStoryKind(entry.acceptedStoryKind.kind)) ||
            $t("Type inconnu")
          }}</b-badge
        ></b-col
      >
      <b-col cols="3">
        <template v-if="entry.acceptedStory">{{
          entry.acceptedStory.storycode
        }}</template
        ><template v-else>{{ $t("Contenu inconnu") }}</template>
      </b-col>
      <b-col col cols="6"
        >{{ title || $t("Sans titre") }}
        <template v-if="entry.part">
          - {{ $t("partie") }} {{ entry.part }}</template
        >
        <br />
        <small>{{ entry.entrycomment }}</small>
        &nbsp;<a
          v-if="urlEncodedStorycode"
          target="_blank"
          :href="`https://inducks.org/story.php?c=${urlEncodedStorycode}`"
        >
          {{ $t("Détails de l'histoire") }}
        </a>
      </b-col></template
    >
  </b-row>
</template>
<script setup lang="ts">
import useAi from "~/composables/useAi";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import { FullEntry } from "~dumili-services/indexation/types";
import { storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import type { storyKind } from "~prisma/client_dumili";

const { t: $t } = useI18n();
defineProps<{
  editable: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const { indexation } = storeToRefs(suggestions());
const { runStorycodeOcr, runKumiko } = useAi();

const entry = defineModel<FullEntry>({ required: true });

const pagesWithInferredKinds = computed(() =>
  getEntryPages(indexation.value!, entry.value.id).map((page) => ({
    page,
    "inferred page story kind": storyKinds.find(
      ({ code }) => code === page.aiKumikoInferredStoryKind,
    )?.label,
  })),
);

watch(
  () => entry.value.acceptedStoryKind,
  (storyKind) => {
    indexationSocket.value!.services.acceptStoryKindSuggestion(
      entry.value.id,
      storyKind?.id || null,
    );
  },
);

watch(
  () => [
    entry.value.entirepages,
    entry.value.brokenpagenumerator,
    entry.value.brokenpagedenominator,
  ],
  ([entirepages, brokenpagenumerator, brokenpagedenominator]) => {
    indexationSocket.value!.services.updateEntryLength(entry.value.id, {
      entirepages,
      brokenpagenumerator,
      brokenpagedenominator,
    });
  },
);

const { acceptedStories } = storeToRefs(suggestions());
const { storyDetails } = storeToRefs(coa());
const { showAiDetectionsOn } = storeToRefs(ui());

const pages = computed(() => getEntryPages(indexation.value!, entry.value.id));

const acceptedStory = computed(() => acceptedStories.value[entry.value.id]);

const storyKindAiSuggestion = computed(() =>
  entry.value.storyKindSuggestions.find(({ isChosenByAi }) => isChosenByAi),
);

const storyAiSuggestions = computed(() =>
  entry.value.storySuggestions.filter(({ ocrDetailsId }) => ocrDetailsId),
);

const storycode = computed(() => acceptedStory.value?.storycode);
const title = computed(() => entry.value.title || $t("Sans titre"));

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value),
);

const getStoryKind = (storyKind: storyKind) =>
  storyKinds.find(({ code }) => code === storyKind)?.label;
</script>

<style scoped lang="scss">
@use "sass:color";

.col {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.dropdown-menu) {
  background: lightgrey;
  overflow-x: visible !important;
}
.badge,
:deep(.dropdown-item) {
  width: max(100%, max-content);
}

@mixin storyKindBackground($bg) {
  background-color: $bg;
  color: color.invert($bg);
  &.btn:hover {
    background-color: color.adjust($bg, $lightness: 10%);
  }
}

.badge,
:deep(.btn-group .btn),
:deep(.dropdown-item) {
  @include storyKindBackground(lightgrey);
  &.kind-c {
    @include storyKindBackground(#ffcc33);
  }

  &.kind-n {
    @include storyKindBackground(#cbdced);
  }

  &.kind-n_g {
    @include storyKindBackground(#ff99ff);
  }
}

.dark {
  color: black;
}
:deep(.tooltip.show) {
  opacity: 1 !important;
}

:deep(.tooltip-inner) {
  max-width: initial;
  white-space: nowrap;
}
</style>
