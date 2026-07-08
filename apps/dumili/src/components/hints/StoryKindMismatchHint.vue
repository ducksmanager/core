<template>
  <span
    v-if="
      entry.acceptedStoryKind &&
      storyDetails[suggestion.storycode]?.originalstoryversioncode &&
      entry.acceptedStoryKind?.storyKindRows.kind !==
        storyversionDetails[
          storyDetails[suggestion.storycode].originalstoryversioncode!
        ]?.kind
    "
    :title="
      $t(
        'Le type de l\'histoire sélectionnée ne correspond pas au type de l\'entrée',
      )
    "
  >
    <i-bi-exclamation-triangle-fill
  /></span>
</template>

<script setup lang="ts">
import type { FullEntry } from "~dumili-services/indexation";

defineProps<{
  entry: FullEntry;
  suggestion: NonNullable<FullEntry["acceptedStory"]>;
}>();

const { storyDetails, storyversionDetails } = storeToRefs(coa());
</script>
