<template>
  <span
    class="position-relative"
    @mouseout="() => (showRepeat = false)"
    @mouseover="() => (showRepeat = true)"
  >
    <b-tooltip :target="id" click><slot /></b-tooltip>
    <AiSuggestionIcon
      :id="id"
      status="info"
      class="me-5"
      :disabled="disabled"
      @click.stop="() => {}" />
    <i-bi-arrow-repeat
      v-show="showRepeat"
      class="position-absolute right-0"
      @click="emit('re-run')"
  /></span>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);
defineSlots();

const emit = defineEmits<{
  (e: "re-run"): void;
}>();

const showRepeat = ref(false);
</script>

<style lang="scss" scoped>
svg {
  width: 20px;
  height: 20px;

  cursor: pointer;
}

.right-0 {
  right: 0;
}
</style>