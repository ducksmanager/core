<template>
  <component
    :is="component"
    :id="id"
    :class="{
      button,
      [status]: true,
      broken: status === 'failure',
    }"
  />
</template>
<script setup lang="ts">
import IBiExtraLightbulbBrokenFill from "~icons/extra-icons/brokenLightbulb";
import IBiLightbulbFill from "~icons/bi/lightbulb-fill";

const { status, id = undefined } = defineProps<{
  button?: boolean;
  status: "success" | "failure" | "idle" | "loading";
  id?: string;
}>();

const component = computed(() =>
  status === "failure" ? IBiExtraLightbulbBrokenFill : IBiLightbulbFill,
);
</script>

<style lang="scss" scoped>
@keyframes pulse-yellow {
  0% {
    color: #999;
  }
  50% {
    color: yellow;
  }
  100% {
    color: #999;
  }
}

svg {
  width: 20px;
  min-width: 20px;

  cursor: help;

  &.button {
    background: black;
    border-radius: 10px;
    padding: 4px;
    height: 20px;
  }

  &.idle {
    color: grey;
  }

  &.success {
    color: yellow;
  }

  &.failure {
    color: orange;
  }

  &.loading {
    animation: pulse-yellow 1.5s infinite;
    pointer-events: none;
    cursor: not-allowed;
  }
}
</style>
