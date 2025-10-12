<template>
  <vue-draggable-resizable
    :active="isCurrentEntry"
    :parent="true"
    prevent-deactivation
    :resizable="showVerticalResizeHandle"
    :draggable="true"
    :handles="['bm']"
    :grid="[1000, pageHeight]"
    :h="height"
    :y="y"
    :min-height="pageHeight"
    :on-resize="onResize"
    :on-drag="onDrag"
    role="button"
    :class-name="`position-absolute d-flex align-items-center justify-content-center cursor-pointer col w-100 kind-${entry.acceptedStoryKind?.storyKindRows.kind} ${(overlay?.type === 'story kind' && overlay.entryId === entry.id && 'striped') || ''} ${(isCurrentEntry && 'active') || ''} ${(showVerticalResizeHandle && 'up-and-down') || ''}`"
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
    <template #bm>
      <i-bi-arrows-expand v-if="showVerticalResizeHandle" />
    </template>
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

const y = computed(() => (entry.value.position - 1) * pageHeight.value);

const height = computed(() => entry.value.entirepages * pageHeight.value);

const showVerticalResizeHandle = computed(
  () =>
    entry.value.entirepages > 1 ||
    shouldAcceptChange(y.value, height.value + pageHeight.value),
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

const { currentEntry, overlay, pageHeight, currentPage } = storeToRefs(ui());

const isCurrentEntry = computed(
  () => currentEntry.value?.id === entry.value.id,
);

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
.draggable {
  border-top: 1px solid black !important;
  z-index: 2 !important;

  &:last-child::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    border-bottom: 1px solid black !important;
  }

  &.active {
    z-index: 3 !important;
    box-shadow:
      inset 0 5px 5px -5px black,
      inset 0 -5px 5px -5px black;
  }
}

.resizable {
  :deep(.handle) {
    border: 0;
    z-index: 1021 !important;
    width: initial;
    height: initial;
  }

  &.up-and-down {
    :deep(.handle) {
      bottom: -7px;
    }
  }
}
</style>
