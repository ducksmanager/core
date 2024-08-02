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
interface Props {
  issuecode: string;
  stepNumber: number;
  options: {
    fill: string;
  };
}
const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    fill: "#ff0000",
  }),
});

const { attributes, width, height } = useStepOptions(props, ["fill"]);
</script>
