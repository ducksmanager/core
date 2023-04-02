<template>
  <polygon
    ref="polygon"
    :points="options.points"
    :style="{ fill: options.fill }"
  >
    <metadata>{{ options }}</metadata>
  </polygon>
</template>

<script setup lang="ts">
import { globalEvent } from "~/stores/globalEvent";
import { ui } from "~/stores/ui";

const polygon = ref(null);

interface Props {
  issuenumber: string;
  stepNumber: number;
  options: {
    points: string;
    fill: string;
  };
}

const pointsAsString = (points: [number, number][]) =>
  points.map((point) => point.join(",")).join(";");

const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    points: pointsAsString([
      [1, 5],
      [4, 25],
      [7, 14],
      [14, 12],
    ]),
    fill: "#000000",
  }),
});

const points = computed((): [number, number][] =>
  props.options.points
    .split(";")
    .map((point) => [
      parseFloat(point.split(",")[0]),
      parseFloat(point.split(",")[1]),
    ])
);

onMounted(() => {
  enableDragResize(polygon.value!, {
    onmove: ({ dy, dx }): void => {
      globalEvent().setOptionValues({
        points: pointsAsString(
          points.value.map(([x, y]) => [x + dx / ui().zoom, y + dy / ui().zoom])
        ),
      });
    },
    onresizemove: ({ rect: { width, height } }): void => {
      const heightMaxGrowth = height / ui().zoom;
      const widthMaxGrowth = width / ui().zoom;

      const minX = Math.min(...points.value.map(([x]) => x));
      const maxX = Math.max(...points.value.map(([x]) => x));
      const minY = Math.min(...points.value.map(([, y]) => y));
      const maxY = Math.max(...points.value.map(([, y]) => y));
      const currentWidth = maxX - minX;
      const currentHeight = maxY - minY;
      globalEvent().setOptionValues({
        points: pointsAsString(
          points.value.map(([x, y]) => [
            x + widthMaxGrowth * ((x - minX) / currentWidth),
            y + heightMaxGrowth * ((y - minY) / currentHeight),
          ])
        ),
      });
    },
  });
});

const { enableDragResize } = useStepOptions(props, []);
</script>
