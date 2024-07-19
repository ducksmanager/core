<template>
  <b-popover
    ref="popper"
    container="body"
    :placement="placement"
    arrow
    manual
    :model-value="isOverPopup || isOverPopupText"
    @open:popper="
      onOpen();
      $emit('@open:popper');
    "
    ><template #target>
      <span
        @mouseover="isOverPopupText = true"
        @mouseout.prevent="closePopupSoon"
        ><slot
      /></span>
    </template>
    <slot name="header" />
    <slot name="content" />
  </b-popover>
</template>

<script setup lang="ts">
import type Placement from "bootstrap-vue-next/dist/src/types/PopoverPlacement";

const { placement = "top" } = defineProps<{
  placement?: Placement.PopoverPlacement;
}>();

defineEmits<(e: "@open:popper") => void>();

const closeDelay = 2000;
const closePopupSoon = () => {
  setTimeout(() => {
    isOverPopupText.value = false;
  }, closeDelay);
};
const isOverPopup = ref(false);
const isOverPopupText = ref(false);

const onOpen = () => {
  for (const element of document.getElementsByClassName("popper"))
    (element as HTMLElement).style.display = "none";
};
</script>

<style scoped lang="scss">
:deep(.popper) {
  &.fade-leave-active {
    display: none !important;
  }
}
div.inline-block {
  // Remove strange CSS properties added by Popper
  border: 0 !important;
  margin: 0 !important;
}
:deep(.card-body > div:not(.card-header)) {
  padding: 1rem;
}
</style>
