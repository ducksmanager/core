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
      :show="isHovered && image?.aiKumikoResultPanels?.length! > 0"
      :status="image?.aiKumikoInferredStoryKind ? 'success' : 'idle'"
      :on-click-rerun="() => runKumikoOnPage(id)"
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
      <b>{{ $t("Type d'entrée déduit pour la page") }}</b>
      {{
        image?.aiKumikoInferredStoryKind
          ? storyKinds[image.aiKumikoInferredStoryKind] || $t("Non calculé")
          : $t("Non calculé")
      }}
    </ai-tooltip>
  </b-col>
</template>
<script setup lang="ts">
import useAi from "~/composables/useAi";
import { ui } from "~/stores/ui";
import { FullIndexation } from "~dumili-services/indexation/types";
import { storyKinds } from "~dumili-types/storyKinds";

const { page } = defineProps<{
  page: FullIndexation["pages"][number];
}>();

const { id, image, pageNumber } = page;

const { showAiDetectionsOn, currentPage, visiblePages } = storeToRefs(ui());

const { runKumikoOnPage } = useAi();

const isHovered = ref(false);
</script>