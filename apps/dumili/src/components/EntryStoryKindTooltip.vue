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
    <table-results
      :data="
        pagesWithInferredKinds.map(({ page, ...inferredData }) => ({
          page: page.pageNumber,
          ...inferredData,
        }))
      "
      ><template #no-data>{{
        $t("Aucune case détectée")
      }}</template></table-results
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
import type {
  FullEntry,
  FullIndexation,
} from "~dumili-services/indexation/types";
import { storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

const { entry } = defineProps<{
  entry: FullEntry;
}>();

const { t } = useI18n();

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
      [t("Type d'entrée déduit pour la page")]: page.image!.aiKumikoResult
        ? page.image!.aiKumikoResult.inferredStoryKind
          ? storyKinds[page.image!.aiKumikoResult.inferredStoryKind]
          : t("Type inconnu")
        : t("Non calculé"),
    })),
);
</script>
