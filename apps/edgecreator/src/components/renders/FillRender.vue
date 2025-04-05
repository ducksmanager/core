<template>
  <svg>
    <rect
      ref="rect"
      stroke-width="0"
      v-bind="attributes"
      x="0"
      y="0"
      :width="width"
      :height="height"
    >
      <metadata>{{ options }}</metadata>
    </rect>
  </svg>
</template>

<script setup lang="ts">
const {
  issuecode,
  stepNumber,
  options = {
    fill: "#ff0000",
  },
} = defineProps<{
  issuecode: string;
  stepNumber: number;
  options?: {
    fill: string;
  };
}>();

const { attributes, width, height } = useStepOptions(
  {
    issuecode,
    stepNumber,
    options,
  },
  ["fill"],
);
</script>
