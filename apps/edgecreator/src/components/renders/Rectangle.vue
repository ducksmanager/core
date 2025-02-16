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
    <rect ref="rect" v-bind="$props as SVGAttributes">
      <metadata>{{ $props }}</metadata>
    </rect>
  </svg>
</template>

<script setup lang="ts">
import type { SVGAttributes } from "vue";
import type { RenderOrForm } from "./RenderOrForm";

const rect = ref<SVGRectElement>();

const options = withDefaults(
  defineProps<
    RenderOrForm<{
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      stroke: string;
    }>
  >(),
  {
    x: 5,
    y: 5,
    width: 15,
    height: 15,
    fill: "#ff0000",
    stroke: "transparent",
  },
);

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

onMounted(() => {
  if (!options.form) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(rect.value!, {
      coords: () => ({ x: options.x, y: options.y }),
    });
  }
});
</script>
