<template>
  <template
    v-if="
      storyDetails[suggestion.storycode] &&
      originalPagesCount &&
      entryPagesCount !== originalPagesCount
    "
  >
    <Teleport to="body">
      <b-popover
        lazy
        :target="`page-mismatch-${suggestion.storycode.replace(/[ \t]/g, '-')}-${location}`"
        interactive
        ><div>
          {{
            $t(
              "Cette histoire fait généralement {originalPagesCount} pages mais l'entrée de votre indexation en contient {entryPagesCount}.",
              {
                originalPagesCount,
                entryPagesCount,
              },
            )
          }}
        </div>
        <template v-if="location === 'button'">
          <b-button
            v-if="
              originalPagesCount <
              Math.max(entry.entirepages, pagesAvailableCount)
            "
            class="mt-2"
            variant="success"
            size="sm"
            @click="entry.entirepages = originalPagesCount"
            >{{
              $t(
                originalPagesCount > entry.entirepages
                  ? "Étendre cette entrée à {originalPagesCount} page|Étendre cette entrée à {originalPagesCount} pages"
                  : "Réduire cette entrée à {originalPagesCount} page|Réduire cette entrée à {originalPagesCount} pages",
                {
                  originalPagesCount,
                },
                originalPagesCount,
              )
            }}</b-button
          ><b-alert class="mt-3" model-value variant="warning">{{
            $t(
              "Il n'y a pas assez de pages disponibles après cette entrée pour ajuster le nombre de pages ({extraPagesNeeded} pages supplémentaires nécessaires).",
              {
                extraPagesNeeded: originalPagesCount - pagesAvailableCount,
              },
            )
          }}</b-alert></template
        ></b-popover
      >
    </Teleport>
    <i-bi-exclamation-triangle-fill
      :id="`page-mismatch-${suggestion.storycode.replace(/[ \t]/g, '-')}-${location}`"
      class="mx-1"
  /></template>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";

const { suggestion } = defineProps<{
  suggestion: { storycode: string; entryId: number };
  location: "button" | "dropdown";
}>();

const entry = defineModel<FullEntry>({
  required: true,
});

const { storyDetails, storyversionDetails } = storeToRefs(coa());

const { indexation } = storeToRefs(suggestions());

const originalPagesCount = computed(() => {
  const originalstoryversioncode =
    storyDetails.value[suggestion.storycode]?.originalstoryversioncode;
  return (
    (originalstoryversioncode &&
      storyversionDetails.value[originalstoryversioncode]?.entirepages) ||
    null
  );
});

const pagesAvailableCount = computed(() => {
  const nextEntry = indexation
    .value!.entries.filter(
      (e) => !e.includedInEntryId && e.position > entry.value.position,
    )
    .sort((a, b) => a.position - b.position)[0];

  if (!nextEntry) {
    return indexation.value!.pages.length - entry.value.position;
  }
  return nextEntry.position - entry.value.position;
});

const entryPagesCount = computed(
  () => getEntryPages(indexation.value!, suggestion.entryId).length,
);
</script>
