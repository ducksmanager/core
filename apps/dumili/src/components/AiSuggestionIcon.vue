<template>
  <component
    :is="component"
    :id="id"
    :class="{
      button,
      [className]: true,
      [status]: true,
      broken: status === 'failure',
      'ms-2': true,
      'me-4': true,
    }"
  />
</template>
<script setup lang="ts">
import IBiExtraLightbulbBrokenFill from "~icons/extra-icons/brokenLightbulb";
import IBiLightbulbFill from "~icons/bi/lightbulb-fill";

const { class: className, status } = withDefaults(
  defineProps<{
    button?: boolean;
    status: "success" | "failure" | "idle" | "loading";
    id?: string;
    class?: string;
  }>(),
  {
    class: "",
    id: undefined,
  },
);

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
  color: grey;

  &.button {
    background: black;
    border-radius: 10px;
    padding: 4px;
    height: 20px;
  }

  &.success {
    color: yellow;
  }

  &.failure {
    color: orange;
  }

  &.loading {
    animation: pulse-yellow 2s infinite;
    pointer-events: none;
    cursor: not-allowed;
  }
}
</style>
