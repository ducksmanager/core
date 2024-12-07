<template>
  <vue-draggable-resizable
    :active="hoveredEntry?.id === entry.id"
    :parent="true"
    prevent-deactivation
    :resizable="true"
    :draggable="false"
    :handles="['bm']"
    :grid="[1, pageHeight]"
    :h="entry.entirepages * pageHeight"
    :min-height="pageHeight - 1"
    role="button"
    :class-name="`d-flex align-items-center justify-content-center cursor-pointer col w-100 border kind-${entry.acceptedStoryKind?.kind} ${(hoveredEntry === entry && 'striped') || ''} ${(currentEntry?.id === entry.id && 'border-2') || 'border-1'}`"
    @mouseover="hoveredEntry = entry"
    @mouseleave="hoveredEntry = null"
    @resize-stop="
	              (_left: number, _top: number, _width: number, height: number) =>
	                {emit('onEntryResizeStop', height)}
	            "
    @click="currentPage = getFirstPageOfEntry(indexation!.entries, entry.id)"
  >
    <ai-tooltip
      :id="`ai-results-entry-${entry.id}`"
      :rerun-on-event-name-part="`updateEntry(${entry.id}`"
      :show="hoveredEntry?.id === entry.id"
      :status="storyKindAiSuggestion?.kind ? 'success' : 'idle'"
      :on-click-rerun="
        () => runKumiko(entry.id).then(() => runStorycodeOcr(entry.id))
      "
      @click="showAiDetectionsOn = { type: 'entry', id: entry.id }"
      @blur="showAiDetectionsOn = undefined"
    >
      <b>{{ $t("Types d'entrées déduits pour les pages") }}</b>
      <table-results
        :data="
          pagesWithInferredKinds.map(({ page, ...inferredData }) => ({
            page: page.pageNumber,
            ...inferredData,
          }))
        "
      /><br />
      <b>{{ $t("Type d'entrée déduit") }}</b>
      {{
        storyKindAiSuggestion
          ? storyKinds[storyKindAiSuggestion?.kind]
          : $t("Non calculé")
      }}
      <template v-if="entry.acceptedStoryKind?.kind === STORY">
        <template v-if="pages[0].image && storyAiSuggestions.length">
          {{ $t("Résultats OCR pour la première case:") }}
          <table-results :data="pages[0].image.aiOcrResults" />
          {{ $t("Histoires potentielles:") }}
          <table-results
            :data="
                storyAiSuggestions.map(({ storycode }) => ({
                  storycode,
                  title: storyDetails[storycode!].title,
                }))
              " /></template
        ><template v-else>{{ $t("Pas de résultats OCR") }}</template></template
      ></ai-tooltip
    >
  </vue-draggable-resizable>
  <b-button
    v-if="isLastEntry && lastHoveredEntry?.id === entry.id"
    class="create-entry fw-bold position-absolute mt-n1 d-flex justify-content-center align-items-center"
    title="Create an entry here"
    variant="info"
    @click="emit('createEntryAfter')"
    >{{ $t("Ajouter une entrée") }}</b-button
  >
</template>

<script setup lang="ts">
import useAi from "~/composables/useAi";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import { FullEntry } from "~dumili-services/indexation/types";
import { getEntryPages, getFirstPageOfEntry } from "~dumili-utils/entryPages";
import { STORY, storyKinds } from "~dumili-types/storyKinds";
import AiTooltip from "./AiTooltip.vue";

const emit = defineEmits<{
  (e: "createEntryAfter"): void;
  (e: "onEntryResizeStop", height: number): void;
}>();

const { entry } = defineProps<{
  entry: FullEntry;
}>();

const aiTooltip = ref<InstanceType<typeof AiTooltip> | null>(null);

const { indexation } = storeToRefs(suggestions());
const {
  hoveredEntry,
  currentEntry,
  showAiDetectionsOn,
  pageHeight,
  currentPage,
} = storeToRefs(ui());

const { storyDetails } = storeToRefs(coa());

const pages = computed(() => getEntryPages(indexation.value!, entry.id));

const storyAiSuggestions = computed(() =>
  entry.storySuggestions.filter(({ ocrDetails }) => ocrDetails),
);

const { t: $t } = useI18n();
const { runStorycodeOcr, runKumiko } = useAi();
const lastHoveredEntry = ref<typeof hoveredEntry.value | null>(null);
const isLastEntry = computed(
  () =>
    entry.id ===
    indexation.value!.entries[indexation.value!.entries.length - 1]!.id,
);

const storyKindAiSuggestion = computed(() =>
  entry.storyKindSuggestions.find(({ isChosenByAi }) => isChosenByAi),
);

const pagesWithInferredKinds = computed(() =>
  getEntryPages(indexation.value!, entry.id)
    .filter(({ image }) => image)
    .map((page) => ({
      page,
      [$t("Type d'entrée déduit pour la page")]: page.image!
        .aiKumikoInferredStoryKind
        ? storyKinds[page.image!.aiKumikoInferredStoryKind]
        : $t("Non calculé"),
    })),
);

watch(hoveredEntry, (entry) => {
  if (entry) {
    lastHoveredEntry.value = entry;
  }
});
</script>
<style lang="scss" scoped>
.striped {
  opacity: 1;
}
</style>
