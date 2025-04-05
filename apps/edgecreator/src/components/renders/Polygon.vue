<template>
  <form-color-input-row
    v-if="isForm"
    v-model="fill"
    option-name="fill"
    :label="$t('Fill color').toString()"
    :has-multiple-values="hasMultipleValues"
  />
  <svg v-else>
    <polygon ref="polygon" :points="pointsAsString(pointsArray)" :fill="fill">
      <metadata>{{ $props }}</metadata>
    </polygon>
  </svg>
</template>

<script setup lang="ts">
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

const polygon = ref<SVGPolygonElement>();

const pointsAsString = (points: [number, number][]) =>
  points.map((point) => point.join(",")).join(";");

const { stepNumber = undefined, hasMultipleValues = false } = defineProps<{
  stepNumber?: number;
  hasMultipleValues?: boolean;
}>();

const isForm = computed(() => stepNumber !== undefined);

const points = defineModel<string>({
  default: [
    [1, 5],
    [4, 25],
    [7, 14],
    [14, 12],
  ]
    .map((point) => point.join(","))
    .join(";"),
});
const fill = defineModel<string>({ default: "#000000" });

const pointsArray = computed((): [number, number][] =>
  isForm.value
    ? []
    : points.value
        .split(";")
        .map((point) => [
          parseFloat(point.split(",")[0]),
          parseFloat(point.split(",")[1]),
        ]),
);

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(polygon.value!, {
      onmove: ({ dy, dx }): void => {
        step().setOptionValues({
          points: pointsAsString(
            pointsArray.value.map(([x, y]) => [
              x + dx / ui().zoom,
              y + dy / ui().zoom,
            ]),
          ),
        });
      },
      onresizemove: ({ rect: { width, height } }): void => {
        const heightMaxGrowth = height / ui().zoom;
        const widthMaxGrowth = width / ui().zoom;

        const minX = Math.min(...pointsArray.value.map(([x]) => x));
        const maxX = Math.max(...pointsArray.value.map(([x]) => x));
        const minY = Math.min(...pointsArray.value.map(([, y]) => y));
        const maxY = Math.max(...pointsArray.value.map(([, y]) => y));
        const currentWidth = maxX - minX;
        const currentHeight = maxY - minY;
        step().setOptionValues({
          points: pointsAsString(
            pointsArray.value.map(([x, y]) => [
              x + widthMaxGrowth * ((x - minX) / currentWidth),
              y + heightMaxGrowth * ((y - minY) / currentHeight),
            ]),
          ),
        });
      },
    });
  }
});
</script>
