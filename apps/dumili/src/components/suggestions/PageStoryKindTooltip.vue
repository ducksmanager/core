<template>
  <ai-tooltip
    :id="`ai-results-page-${page.pageNumber}`"
    :status="
      !page.image
        ? 'failure'
        : page.image?.aiKumikoResult?.inferredStoryKindRows
          ? 'success'
          : 'idle'
    "
    top-center
    :loading-events="[
      {
        eventName: 'reportSetKumikoInferredPageStoryKinds',
        checkMatch: (id) => id === page.id,
      },
    ]"
    @toggled="
      overlay = $event ? { type: 'panels', pageId: page.id } : undefined
    "
  >
    <div v-if="!page.image">
      {{
        $t(
          "Le type d'entrée de cette page ne peut pas être détecté car aucune image n'y est associée",
        )
      }}
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
        :kind="page.image?.aiKumikoResult?.inferredStoryKindRows?.kind"
    /></template>
  </ai-tooltip>
</template>

<script setup lang="ts">
import { ui } from "~/stores/ui";
import type { FullIndexation } from "~dumili-services/indexation";

const { page } = defineProps<{
  page: FullIndexation["pages"][number];
}>();

const { overlay } = storeToRefs(ui());
</script>