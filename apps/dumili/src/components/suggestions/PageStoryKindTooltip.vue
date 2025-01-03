<template>
  <ai-tooltip
    :id="`ai-results-page-${page.pageNumber}`"
    :status="page.image?.aiKumikoResult?.inferredStoryKind ? 'success' : 'idle'"
    top-center
    :loading-events="[
      {
        eventName: 'setKumikoInferredPageStoryKinds',
        checkMatch: (id) => id === page.id,
      },
    ]"
    @toggled="
      showAiDetectionsOn = $event ? { type: 'page', id: page.id } : undefined
    "
  >
    <div v-if="!page.image">
      {{ $t("Aucune image") }}
    </div>
    <template v-else>
      <b>{{ $t("Cases détectées") }}</b>
      <table-results
        :data="
          page.image?.aiKumikoResult?.detectedPanels.map(
            ({ x, y, width, height }) => ({
              x,
              y,
              width,
              height,
            }),
          ) || []
        " />
      <div>
        <b>{{ $t("Type d'entrée déduit pour la page") }}</b>
      </div>
      <story-kind-badge
        :story-kind="page.image?.aiKumikoResult?.inferredStoryKind"
    /></template>
  </ai-tooltip>
</template>

<script setup lang="ts">
import { ui } from "~/stores/ui";
import type { FullIndexation } from "~dumili-services/indexation";

const { page } = defineProps<{
  page: FullIndexation["pages"][number];
}>();

const { showAiDetectionsOn } = storeToRefs(ui());
</script>