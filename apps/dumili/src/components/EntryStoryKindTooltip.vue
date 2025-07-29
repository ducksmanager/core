<template>
  <ai-tooltip
    :id="`ai-results-entry-${entry.id}`"
    :loading-events="[
      {
        eventName: 'reportSetInferredEntryStoryKind',
        checkMatch: (id) => id === entry.id,
      },
    ]"
    :status="
      !pages[0].image
        ? 'failure'
        : storyKindAiSuggestion?.storyKindRows
          ? 'success'
          : 'idle'
    "
    @toggled="
      overlay = $event ? { type: 'panels', entryId: entry.id } : undefined
    "
  >
    <div v-if="!pages[0].image">
      {{
        $t(
          "Le type d'entrée ne peut pas être détecté car aucune image n'est associée avec sa première page",
        )
      }}
    </div>
    <template v-else>
      <b-table
        :fields="[
          { key: 'page' },
          { key: 'kind', label: $t('Type d\'entrée déduit pour la page') },
        ]"
        :items="
          pagesWithInferredKinds.map(({ page, ...inferredData }) => ({
            page: page.pageNumber,
            ...inferredData,
          })) || []
        "
        ><template #empty>{{ $t("Aucune case détectée") }}</template>
        <template #cell(kind)="row">
          <story-kind-badge
            :kind="row.item.storyKindRows?.kind" /></template></b-table
      ><br />
      <div>
        <b>{{ $t("Type d'entrée déduit") }}</b>
      </div>
      <story-kind-badge
        :kind="storyKindAiSuggestion?.storyKindRows?.kind" /></template
  ></ai-tooltip>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";

const { entry } = defineProps<{
  entry: FullEntry;
}>();

const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { overlay } = storeToRefs(ui());

const pages = computed(() =>
  getEntryPages(indexation.value!, entry.id).map(
    ({ id: pageId }) =>
      indexation.value!.pages.find(({ id }) => id === pageId)!,
  ),
);

const storyKindAiSuggestion = computed(() =>
  entry.storyKindSuggestions.find(
    ({ aiKumikoResultId }) => aiKumikoResultId !== null,
  ),
);

const pagesWithInferredKinds = computed(() =>
  pages.value
    .filter(({ image }) => image)
    .map((page) => ({
      page,
      storyKindRows: page.image?.aiKumikoResult?.inferredStoryKindRows,
    })),
);
</script>
