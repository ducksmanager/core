<!--suppress RequiredAttributes -->
<template>
  <svg>
    <ellipse
      ref="ellipse"
      v-bind="attributes"
    >
      <metadata>{{ options }}</metadata>
    </ellipse>
  </svg>
</template>

<script setup lang="ts">
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

const uiStore = ui();

interface Props {
  issuecode: string;
  stepNumber: number;
  options: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
    stroke: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    cx: 10,
    cy: 50,
    rx: 10,
    ry: 20,
    fill: "#bb0000",
    stroke: "transparent",
  }),
});

const ellipse = ref<HTMLElement | null>(null);

const { attributes, enableDragResize } = useStepOptions(props, [
  "cx",
  "cy",
  "rx",
  "ry",
  "fill",
  "stroke",
]);

onMounted(() => {
  enableDragResize(ellipse.value!, {
    onmove: ({ dx, dy }) => {
      step().setOptionValues({
        cx: props.options.cx + dx / uiStore.zoom,
        cy: props.options.cy + dy / uiStore.zoom,
      });
    },
    onresizemove: ({ rect }) => {
      step().setOptionValues({
        rx: rect.width / 2 / uiStore.zoom,
        ry: rect.height / 2 / uiStore.zoom,
      });
    },
  });
});
</script>
