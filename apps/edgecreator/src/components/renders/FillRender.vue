<template>
  <rect
    ref="rect"
    v-bind="attributes"
    x="0"
    y="0"
    :width="width"
    :height="height"
  >
    <metadata>{{ options }}</metadata>
  </rect>
</template>

<script setup lang="ts">
interface Props {
  issuenumber: string;
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

const { attributes, width, height } = useStepOptions(props, "Fill", ["fill"]);
</script>
