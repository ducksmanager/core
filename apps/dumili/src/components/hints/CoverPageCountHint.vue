<template>
  <span
    v-if="
      location === 'button' &&
      getEntryPages(indexation, entry.id).length > 1 &&
      acceptedStoryKind?.storyKindRows.kind === COVER
    "
    class="d-flex ms-1"
    :title="$t('La couverture ne devrait faire qu\'une page')"
  >
    <i-bi-exclamation-triangle-fill
  /></span>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { COVER } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

defineProps<{
  entry: FullEntry;
  acceptedStoryKind?: FullEntry["acceptedStoryKind"];
  location: "button" | "dropdown";
}>();

const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
</script>
