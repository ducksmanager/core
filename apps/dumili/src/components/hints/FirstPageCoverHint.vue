<template>
  <span
    v-if="
      location === 'button' &&
      getEntryPages(indexation!, entry.id)[0].pageNumber === 1 &&
      acceptedStoryKind?.storyKindRows.kind !== COVER
    "
    class="d-flex ms-1"
    :title="$t('La première page est généralement une page de couverture')"
  >
    <i-bi-exclamation-triangle-fill
  /></span>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { COVER } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

defineProps<{
  entry: FullEntry;
  acceptedStoryKind?: FullEntry["acceptedStoryKind"];
  location: "button" | "dropdown";
}>();

const { indexation } = storeToRefs(suggestions());
</script>
