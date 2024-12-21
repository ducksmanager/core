<template>
  <b-col
    role="button"
    :class="{
      'fw-bold': visiblePages?.has(id),
    }"
    @mouseover="() => (isHovered = true)"
    @mouseleave="() => (isHovered = false)"
    @click="currentPage = pageNumber - 1"
    ><div>{{ $t("Page") }} {{ pageNumber }}</div>
    <ai-tooltip
      :id="`ai-results-page-${pageNumber}`"
      :status="image?.aiKumikoInferredStoryKind ? 'success' : 'idle'"
      :on-click-rerun="() => runKumikoOnPage(id)"
      :loading-event="{
        startEventName: 'setKumikoInferredPageStoryKinds',
        endEventName: 'setKumikoInferredPageStoryKindsEnd',
        checkMatch: (id) => id === page.id,
      }"
      @click="showAiDetectionsOn = { type: 'page', id }"
    >
      <b>{{ $t("Cases détectées") }}</b>
      <table-results
        :data="
          image?.aiKumikoResultPanels.map(({ x, y, width, height }) => ({
            x,
            y,
            width,
            height,
          })) || []
        "
      />
      <div>
        <b>{{ $t("Type d'entrée déduit pour la page") }}</b>
      </div>
      <story-kind-badge :story-kind="image?.aiKumikoInferredStoryKind" />
    </ai-tooltip>
  </b-col>
</template>
<script setup lang="ts">
import useAi from "~/composables/useAi";
import { ui } from "~/stores/ui";
import { FullIndexation } from "~dumili-services/indexation/types";

const { page } = defineProps<{
  page: FullIndexation["pages"][number];
}>();

const { id, image, pageNumber } = page;

const { showAiDetectionsOn, currentPage, visiblePages } = storeToRefs(ui());

const { runKumikoOnPage } = useAi();

const isHovered = ref(false);
</script>