<template>
  <i-bi-extra-lightbulb-broken-fill
    v-if="disabled"
    :id="id"
    :class="`${className} broken ms-2 me-4 ${status === 'info' ? 'black-background' : ''}`"
  />
  <i-bi-lightbulb-fill
    v-else
    :id="id"
    :class="`${className} ms-2 ${status === 'info' ? 'black-background' : ''}`"
  />
</template>
<script setup lang="ts">
import IBiExtraLightbulbBrokenFill from "~icons/extra-icons/brokenLightbulb";

const { class: className } = defineProps<{
  status: "success" | "failure" | "info";
  id?: string;
  disabled?: boolean;
  class?: string;
}>();
</script>

<style lang="scss" scoped>
svg {
  width: 20px;
  min-width: 20px;
  color: yellow;

  &.black-background {
    background: black;
    cursor: help;
    border-radius: 10px;
    padding: 4px;
    height: 20px;
  }

  &.broken {
    color: orange;
    cursor: not-allowed;
  }
}
</style>
