<template>
  <svg>
    <g>
      <metadata>{{ options }}</metadata>
      <rect
        ref="rect1"
        v-bind="{
          ...attributes,
          width: 0.5,
          stroke: 'black',
          x: dimensions.width / 2 - 0.25,
          y:
            dimensions.height / 2 - options.yDistanceFromCenter! - options.height,
        }"
      />
      <rect
        ref="rect2"
        v-bind="{
          ...attributes,
          width: 0.5,
          stroke: 'black',
          x: dimensions.width / 2 - 0.25,
          y: dimensions.height / 2 + options.yDistanceFromCenter!,
        }"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

const rect1 = ref<SVGRectElement>();
const rect2 = ref<SVGRectElement>();

interface Props {
  issuecode: string;
  stepNumber: number;
  options: {
    yDistanceFromCenter?: number | undefined;
    height: number;
  };
}
const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    yDistanceFromCenter: 5,
    height: 15,
  }),
});

const { enableDragResize, height, attributes } = useStepOptions(props, [
  "height",
]);

const dimensions = computed(
  () =>
    step().getFilteredDimensions({
      issuecodes: [props.issuecode],
    })[0],
);

const onmove = ({
  currentTarget,
  dy,
}: {
  currentTarget: SVGElement | HTMLElement;
  dx: number;
  dy: number;
}) => {
  const stapleHeight = props.options.height;
  const isStaple2 = rect2.value === currentTarget;
  const yDistanceFromCenter = Math.min(
    Math.max(
      stapleHeight,
      (props.options.yDistanceFromCenter ?? 0) +
        ((isStaple2 ? 1 : -1) * dy) / ui().zoom,
    ),
    height.value / 2 - stapleHeight * 2,
  );
  step().setOptionValues({
    yDistanceFromCenter,
  });
};

onMounted(() => {
  // if (props.options.yDistanceFromCenter === undefined) {
  //   step().setOptionValues({
  //     yDistanceFromCenter:
  //       parseInt(resolveHeightTemplate(props.options.y2, height.value)) -
  //       height.value / 2,
  //   });
  // }
  enableDragResize(rect1.value, {
    onmove,
    onresizemove: () => {
      return;
    },
  });
  enableDragResize(rect2.value, {
    onmove,
    onresizemove: () => {
      return;
    },
  });
});
</script>
