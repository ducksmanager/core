<template>
  <vue-draggable-resizable
    :active="hoveredEntry?.id === entry.id"
    :parent="true"
    prevent-deactivation
    :resizable="true"
    :draggable="false"
    :handles="['bm']"
    :grid="[1, pageHeight]"
    :h="entry.entirepages * pageHeight"
    :min-height="pageHeight - 1"
    role="button"
    :class-name="`position-relative d-flex z-3 align-items-center justify-content-center cursor-pointer col w-100 border kind-${entry.acceptedStoryKind?.kind} ${(hoveredEntry === entry && 'striped') || ''} ${(currentEntry?.id === entry.id && 'border-2') || 'border-1'}`"
    @mouseover="hoveredEntry = entry"
    @mouseleave="hoveredEntry = null"
    @resize-stop="
	              (_left: number, _top: number, _width: number, height: number) =>
	                {emit('onEntryResizeStop', height)}
	            "
    @click="currentPage = getFirstPageOfEntry(indexation!.entries, entry.id)"
  >
    <Entry v-model="entry" :editable="currentEntry === entry" />
  </vue-draggable-resizable>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type {
  FullEntry,
  FullIndexation,
} from "~dumili-services/indexation/types";
import { getFirstPageOfEntry } from "~dumili-utils/entryPages";

const emit = defineEmits<{
  (e: "onEntryResizeStop", height: number): void;
}>();

const entry = defineModel<FullEntry>({ required: true });

const { hoveredEntry, currentEntry, pageHeight, currentPage } =
  storeToRefs(ui());

const lastHoveredEntry = ref<typeof hoveredEntry.value | null>(null);

const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;

watch(hoveredEntry, (entry) => {
  if (entry) {
    lastHoveredEntry.value = entry;
  }
});
</script>
<style lang="scss" scoped>
.striped {
  opacity: 1;
}
</style>
