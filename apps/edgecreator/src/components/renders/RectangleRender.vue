<template>
  <svg>
    <rect ref="rect" v-bind="options">
      <metadata>{{ options }}</metadata>
    </rect>
  </svg>
</template>

<script setup lang="ts">
const rect = ref<SVGRectElement | null>(null);

interface Props {
  issuenumber: string;
  stepNumber: number;
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    x: 5,
    y: 5,
    width: 15,
    height: 15,
    fill: "#ff0000",
    stroke: "transparent",
  }),
});

onMounted(() => {
  enableDragResize(rect.value!);
});

const { enableDragResize } = useStepOptions(props, [
  "x",
  "y",
  "width",
  "height",
  "fill",
  "stroke",
]);
</script>
