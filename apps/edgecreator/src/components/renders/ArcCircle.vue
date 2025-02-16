<template>
  <template v-if="options.form">
    <form-color-input-row
      v-for="optionName in ['fill', 'stroke']"
      :key="optionName"
      :input-values="options.form"
      :option-name="optionName"
      :label="$t(ucFirst(`${optionName} color`)).toString()"
      can-be-transparent
    />
  </template>
  <svg v-else>
    <ellipse ref="ellipse" v-bind="$props as SVGAttributes">
      <metadata>{{ $props }}</metadata>
    </ellipse>
  </svg>
</template>

<script setup lang="ts">
import type { SVGAttributes } from "vue";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import type { RenderOrForm } from "./RenderOrForm";

const { zoom } = storeToRefs(ui());
const options = defineProps<
  RenderOrForm<{
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
    stroke: string;
  }>
>();

const ellipse = ref<HTMLElement>();

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

onMounted(() => {
  if (!options.form) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(ellipse.value!, {
      onmove: ({ dx, dy }) => {
        step().setOptionValues({
          cx: options.cx + dx / zoom.value,
          cy: options.cy + dy / zoom.value,
        });
      },
      onresizemove: ({ rect }) => {
        step().setOptionValues({
          rx: rect.width / 2 / zoom.value,
          ry: rect.height / 2 / zoom.value,
        });
      },
    });
  }
});
</script>
