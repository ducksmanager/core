<template>
  <span
    @mouseout="() => (showRepeat = false)"
    @mouseover="() => (showRepeat = true)"
  >
    <b-tooltip :target="id" click @show="emit('click')" @hide="emit('blur')"
      ><slot
    /></b-tooltip>
    <AiSuggestionIcon
      :id="disabled ? `${id}-disabled` : id"
      button
      :status="status" />
    <i-bi-arrow-repeat v-show="showRepeat" class="ms-2" @click="onClickRerun"
  /></span>
</template>
<script setup lang="ts">
const { value } = defineProps<{
  id: string;
  value: string[] | string | null | undefined;
  onClickRerun: (...args: unknown[]) => void | Promise<void>;
}>();
defineSlots();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "blur"): void;
}>();

const disabled = ref(false); // TODO handle failed suggestions
const status = computed(() => (value ? "success" : "idle"));

const showRepeat = ref(false);
</script>

<style lang="scss" scoped>
span > svg {
  width: 20px;
  height: 20px;
  color: black;
  cursor: pointer;
}
</style>