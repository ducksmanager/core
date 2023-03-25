<template>
  <popper
    ref="popper"
    :placement="placement"
    arrow
    manual
    :show="isOverPopup || isOverPopupText"
    @open:popper="
      onOpen();
      $emit('@open:popper');
    "
  >
    <span @mouseover="isOverPopupText = true" @mouseout.prevent="closePopupSoon"
      ><slot
    /></span>
    <template #content>
      <b-card
        body-class="p-0"
        @mouseenter="isOverPopup = true"
        @mouseleave="isOverPopup = false"
      >
        <b-card-header v-if="$slots.header">
          <slot name="header" />
        </b-card-header>
        <slot name="content" />
      </b-card>
    </template>
  </popper>
</template>

<script setup lang="ts">
import Popper from "@bperel/vue3-popper-teleport";
const { placement = "top" } = defineProps<{
  placement?: string;
}>();

defineEmits<{ (e: "@open:popper"): void }>();

const closeDelay = 2000;
const closePopupSoon = () => {
  setTimeout(() => {
    isOverPopupText.value = false;
  }, closeDelay);
};
const isOverPopup = ref(false);
let isOverPopupText = ref(false);

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
