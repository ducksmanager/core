<template>
  <div
    class="position-relative d-flex flex-column justify-content-center align-items-center w-100 h-100"
  >
    <EntryStoryKindTooltip v-if="!entry.includedInEntry" :entry="entry" />
    <suggestion-list
      v-model="acceptedStoryKind"
      :class="{ 'w-100': true }"
      :suggestions="entry.storyKindSuggestions"
      :category="
        ({ aiKumikoResultId }) => (aiKumikoResultId !== null ? 'ai' : 'user')
      "
      :item-class="(suggestion) => [`kind-${suggestion.storyKindRows.kind}`]"
      :show-tooltips="!entry.includedInEntry"
    >
      <template #default="{ suggestion, location }">
        {{ storyKinds[suggestion.storyKindRows.kind]
        }}<template v-if="suggestion.storyKindRows.kind === 'n'"
          >&nbsp;{{
            $t("({rowsPerPage} lignes / page)", {
              rowsPerPage: suggestion.storyKindRows.numberOfRows,
            })
          }}</template
        >
        <FirstPageCoverHint
          :entry="entry"
          :accepted-story-kind="acceptedStoryKind"
          :location="location"
        />
        <CoverPageCountHint
          :entry="entry"
          :accepted-story-kind="acceptedStoryKind"
          :location="location"
        />
      </template>
      <template #unknown-text>{{ $t("Type inconnu") }}</template>
    </suggestion-list>
  </div>
</template>

<script setup lang="ts">
import type { FullEntry } from "~dumili-services/indexation";
import { storyKinds } from "~dumili-types/storyKinds";

defineProps<{
  entry: FullEntry;
}>();

const acceptedStoryKind = defineModel<FullEntry["acceptedStoryKind"]>();
</script>

<style scoped lang="scss">
@use "sass:color";

.badge,
:deep(.dropdown-item) {
  width: max(100%, max-content);
}

@mixin storyKindBackground($bg) {
  background-color: $bg;
  color: black;
  &.btn:hover {
    background-color: color.adjust($bg, $lightness: 10%);
  }
}

.dark {
  color: black;
}
:deep(.tooltip.show) {
  opacity: 1 !important;
}

:deep(.tooltip-inner) {
  max-width: initial;
  white-space: nowrap;
}
</style>
