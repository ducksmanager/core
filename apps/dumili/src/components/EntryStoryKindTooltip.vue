<template>
  <ai-tooltip
    :id="`ai-results-entry-${entry.id}`"
    :loading-events="[
      {
        eventName: 'setInferredEntryStoryKind',
        checkMatch: (id) => id === entry.id,
      },
    ]"
    :status="storyKindAiSuggestion?.kind ? 'success' : 'idle'"
    @toggled="
      showAiDetectionsOn = $event ? { type: 'entry', id: entry.id } : undefined
    "
  >
    <b>{{ $t("Types d'entrées déduits pour les pages") }}</b>
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
        <story-kind-badge :story-kind="row.item.kind" /></template></b-table
    ><br />
    <div>
      <b>{{ $t("Type d'entrée déduit") }}</b>
    </div>
    <story-kind-badge :story-kind="storyKindAiSuggestion?.kind"
  /></ai-tooltip>
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
const { showAiDetectionsOn } = storeToRefs(ui());

const pages = computed(() =>
  getEntryPages(indexation.value!, entry.id).map(
    ({ id: pageId }) =>
      indexation.value!.pages.find(({ id }) => id === pageId)!,
  ),
);

const storyKindAiSuggestion = computed(() =>
  entry.storyKindSuggestions.find(({ ai }) => !!ai),
);

const pagesWithInferredKinds = computed(() =>
  pages.value
    .filter(({ image }) => image)
    .map((page) => ({
      page,
      kind: page.image?.aiKumikoResult?.inferredStoryKind,
    })),
);
</script>
