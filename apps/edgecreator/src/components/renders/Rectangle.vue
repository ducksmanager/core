<template>
  <svg>
    <rect ref="rect" v-bind="options">
      <metadata>{{ options }}</metadata>
    </rect>
  </svg>
</template>

<script setup lang="ts">
const rect = ref<SVGRectElement>();

const {
  issuecode,
  stepNumber,
  options = {
    x: 5,
    y: 5,
    width: 15,
    height: 15,
    fill: "#ff0000",
    stroke: "transparent",
  },
} = defineProps<{
  issuecode: string;
  stepNumber: number;
  options?: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
  };
}>();

const { enableDragResize } = useStepOptions(
  {
    issuecode,
    stepNumber,
    options,
  },
  ["x", "y", "width", "height", "fill", "stroke"],
);

onMounted(() => {
  enableDragResize(rect.value!);
});
</script>
