<template>
  <template v-if="isForm">
    {{ $t("Move and resize the staples directly on the edge.") }}
  </template>
  <svg v-else>
    <g>
      <metadata>{{ $props }}</metadata>
      <rect
        ref="rect1"
        v-bind="{
          ...(options as SVGAttributes),
          width: 0.5,
          height,
          stroke: 'black',

          x: dimensions.width / 2 - 0.25,
          y:
            dimensions.height / 2 - yDistanceFromCenter! - height,
        }"
      />
      <rect
        ref="rect2"
        v-bind="{
          ...(options as SVGAttributes),
          width: 0.5,
          height,
          stroke: 'black',

          x: dimensions.width / 2 - 0.25,
          y: dimensions.height / 2 + yDistanceFromCenter!,
        }"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { type SVGAttributes } from "vue";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

const rect1 = ref<SVGRectElement>();
const rect2 = ref<SVGRectElement>();

const { stepNumber = undefined } = defineProps<{
  stepNumber?: number;
}>();

provide("stepNumber", stepNumber);

const isForm = computed(() => stepNumber !== undefined);

const yDistanceFromCenter = defineModel<number>("yDistanceFromCenter", {
  default: 5,
});
const height = defineModel<number>("height", { default: 15 });

const dimensions = computed(
  () =>
    step().getFilteredDimensions({
      issuecodes: [inject<string>("issuecode")!],
    })[0],
);

const options = computed(() => {
  if (isForm.value) {
    throw new Error("not implemented in form mode");
  }
  return {
    x: dimensions.value.width / 2 - 0.25,
    y1: dimensions.value.height / 2 - yDistanceFromCenter.value - height.value,
    y2: height.value / 2 + yDistanceFromCenter.value,
  };
});

const onmove = ({
  currentTarget,
  dy,
}: {
  currentTarget: SVGElement | HTMLElement;
  dx: number;
  dy: number;
}) => {
  if (!isForm.value) {
    const edgeHeight = dimensions.value.height;
    const isStaple2 = rect2.value === currentTarget;
    const newDistance =
      (yDistanceFromCenter.value ?? 0) +
      ((isStaple2 ? 1 : -1) * dy) / ui().zoom;

    if (
      // newDistance > height.value &&
      newDistance <
      edgeHeight / 2 - height.value * 2
    ) {
      yDistanceFromCenter.value = newDistance;
    }
  }
};

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(rect1.value, {
      onmove,
      onresizemove: () => {},
    });
    enableDragResize(rect2.value, {
      onmove,
      onresizemove: () => {},
    });
  }
});
</script>
