<template>
  <span
    class="position-relative"
    @mouseout="() => (showRepeat = false)"
    @mouseover="() => (showRepeat = true)"
  >
    <b-tooltip :target="id" click><slot /></b-tooltip>
    <AiSuggestionIcon
      :id="disabled ? `${id}-disabled` : id"
      button
      :status="status"
      class="me-5"
      @click.stop="() => {}" />
    <i-bi-arrow-repeat
      v-show="showRepeat"
      class="position-absolute right-0"
      @click="onClickRerun"
  /></span>
</template>
<script setup lang="ts">
const { value } = defineProps<{
  id: string;
  value: string[] | string | null | undefined;
  onClickRerun: (...args: unknown[]) => void | Promise<void>;
}>();
defineSlots();

const disabled = ref(false); // TODO handle failed suggestions
const status = computed(() => (value ? "success" : "idle"));

const showRepeat = ref(false);
</script>

<style lang="scss" scoped>
> svg {
  width: 20px;
  height: 20px;
  color: black;
  cursor: pointer;
}

.right-0 {
  right: 0;
}
</style>