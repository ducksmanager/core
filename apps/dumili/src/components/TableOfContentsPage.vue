<template>
  <b-col
    role="button"
    :class="{
      'fw-bold': visiblePages?.has(id),
    }"
    @click="currentPage = pageNumber - 1"
    >{{ $t("Page") }} {{ pageNumber }}<br /><ai-tooltip
      v-if="aiKumikoResultPanels"
      :id="`ai-results-page-${pageNumber}`"
      :value="aiKumikoInferredStoryKind"
      :on-click-rerun="() => runKumikoOnPage(id)"
      @click="showAiDetectionsOn = { type: 'page', id }"
    >
      <b>{{ $t("Cases détectées") }}</b>
      <table-results
        :data="
          aiKumikoResultPanels.map(({ x, y, width, height }) => ({
            x,
            y,
            width,
            height,
          }))
        "
      />
      <b>{{ $t("Type d'entrée déduit pour la page") }}</b>
      {{
        aiKumikoInferredStoryKind
          ? storyKinds[aiKumikoInferredStoryKind] || $t("Non calculé")
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

const { id, aiKumikoResultPanels, aiKumikoInferredStoryKind, pageNumber } =
  page;

const { showAiDetectionsOn } = storeToRefs(ui());

const { currentPage, visiblePages } = storeToRefs(ui());

const { runKumikoOnPage } = useAi();
</script>