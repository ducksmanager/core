<template>
  <i-bi-extra-lightbulb-broken-fill
    v-if="status === 'failure'"
    v-show="!disabled"
    :id="id"
    class="ms-2"
    color="orange"
  />
  <i-bi-lightbulb-fill
    v-else
    v-show="!disabled"
    :id="id"
    :class="`ms-2 ${status === 'info' ? 'black-background' : ''}`"
    color="yellow"
  />
</template>
<script setup lang="ts">
import IBiExtraLightbulbBrokenFill from "~icons/extra-icons/brokenLightbulb";

defineProps<{
  status: "success" | "failure" | "info";
  id?: string;
  disabled?: boolean;
}>();
</script>

<style lang="scss" scoped>
.black-background {
  background: black;
  cursor: help;
  border-radius: 10px;
  padding: 4px;
  height: 20px;
}
svg {
  width: 20px;
}
</style>
