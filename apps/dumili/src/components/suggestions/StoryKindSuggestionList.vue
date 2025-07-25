<template>
  <div
    class="position-relative d-flex flex-column justify-content-center align-items-center w-100 h-100"
  >
    <EntryStoryKindTooltip :entry="entry" />
    <template v-if="editable">
      <suggestion-list
        v-model="acceptedStoryKind"
        class="position-absolute"
        :suggestions="entry.storyKindSuggestions"
        :is-ai-source="({ aiKumikoResultId }) => aiKumikoResultId !== null"
        :item-class="(suggestion) => [`kind-${suggestion.storyKindRows.kind}`]"
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
          <span
            v-if="
              location === 'button' &&
              getEntryPages(indexation, entry.id)[0].pageNumber === 1 &&
              acceptedStoryKind?.storyKindRows.kind !== COVER
            "
            class="d-flex ms-1"
            :title="
              $t('La première page est généralement une page de couverture')
            "
          >
            <i-bi-exclamation-triangle-fill
          /></span>
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
        <template #unknown-text>{{ $t("Type inconnu") }}</template>
      </suggestion-list>
    </template>
    <story-kind-badge v-else :kind="acceptedStoryKind?.storyKindRows.kind" />
  </div>
</template>

<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { COVER, storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";

const props = defineProps<{
  entry: FullEntry;
  editable: boolean;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;

const acceptedStoryKind = defineModel<FullEntry["acceptedStoryKind"]>();

watch(
  () => acceptedStoryKind.value?.id,
  (storyKindId) => {
    indexationSocket.value!.acceptStoryKindSuggestion(
      props.entry.id,
      storyKindId || null,
    );
  },
);
</script>

<style scoped lang="scss">
@use "sass:color";

.badge,
:deep(.dropdown-item) {
  width: max(100%, max-content);
}

@mixin storyKindBackground($bg) {
  background-color: $bg;
  color: color.invert($bg);
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