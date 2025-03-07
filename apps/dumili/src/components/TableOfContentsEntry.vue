<template>
  <vue-draggable-resizable
    :active="hoveredEntry?.id === entry.id"
    :parent="true"
    prevent-deactivation
    :resizable="true"
    :draggable="true"
    :handles="['bm']"
    :grid="[1000, pageHeight]"
    :h="entry.entirepages * pageHeight"
    :y="(entry.position - 1) * pageHeight"
    :min-height="pageHeight"
    :on-resize="onResize"
    :on-drag="onDrag"
    role="button"
    :class-name="`position-absolute d-flex z-3 align-items-center justify-content-center cursor-pointer col w-100 border kind-${entry.acceptedStoryKind?.kind} ${(overlay?.type === 'story kind' && overlay.entryId === entry.id && 'striped') || ''} ${(currentEntry?.id === entry.id && 'z-4 border-2') || 'border-1'}`"
    @mouseover="hoveredEntry = entry"
    @mouseleave="hoveredEntry = undefined"
    @resize-stop="
      (_left: number, _top: number, _width: number, height: number) => {
        emit('onEntryResizeStop', height);
      }
    "
    @drag-stop="
      (_left: number, top: number) => {
        emit('onEntryDragStop', top);
      }
    "
    @click="currentPage = getFirstPageOfEntry(indexation!.entries, entry.id)"
  >
    <Entry v-model="entry" :editable="currentEntry?.id === entry.id" />
  </vue-draggable-resizable>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { getFirstPageOfEntry } from "~dumili-utils/entryPages";

const emit = defineEmits<{
  (e: "onEntryResizeStop", height: number): void;
  (e: "onEntryDragStop", y: number): void;
}>();

const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const entry = defineModel<FullEntry>({ required: true });
const entryIdx = computed(() =>
  indexation.value!.entries.findIndex((e) => e.id === entry.value.id),
);

const previousEntry = computed(
  () => indexation.value!.entries[entryIdx.value - 1],
);

const nextEntry = computed(() => indexation.value!.entries[entryIdx.value + 1]);

const minPosition = computed(() =>
  previousEntry.value
    ? previousEntry.value.position + previousEntry.value.entirepages
    : 1,
);

const maxLastPageNumber = computed(() =>
  nextEntry.value
    ? nextEntry.value.position - 1
    : indexation.value!.pages.length,
);

const { hoveredEntry, currentEntry, overlay, pageHeight, currentPage } =
  storeToRefs(ui());

const lastHoveredEntry = ref<typeof hoveredEntry.value>();

watch(hoveredEntry, (entry) => {
  if (entry) {
    lastHoveredEntry.value = entry;
  }
});

const shouldAcceptChange = (y: number, height: number) =>
  1 + Math.round(y / pageHeight.value) >= minPosition.value &&
  Math.round((y + height) / pageHeight.value) <= maxLastPageNumber.value;

const onResize = (
  _handle: string,
  _x: number,
  y: number,
  _width: number,
  height: number,
) => shouldAcceptChange(y, height);

const onDrag = (_x: number, y: number) =>
  shouldAcceptChange(y, entry.value.entirepages * pageHeight.value);
</script>
<style lang="scss" scoped>
.striped {
  opacity: 1;
}
:deep(.draggable) {
  background: green;
}
</style>
