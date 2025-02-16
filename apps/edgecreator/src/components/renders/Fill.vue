<template>
  <form-color-input-row
    v-if="options.form"
    :input-values="options.form"
    option-name="fill"
    :label="$t('Fill color').toString()"
  />
  <svg v-else>
    <rect
      ref="rect"
      stroke-width="0"
      v-bind="$props as SVGAttributes"
      x="0"
      y="0"
      :width="width"
      :height="height"
    >
      <metadata>{{ $props }}</metadata>
    </rect>
  </svg>
</template>

<script setup lang="ts">
import type { SVGAttributes } from "vue";
import type { RenderOrForm } from "./RenderOrForm";

const options = withDefaults(
  defineProps<
    RenderOrForm<{
      fill?: string;
    }>
  >(),
  {
    fill: "#ff0000",
  },
);

const width = ref();
const height = ref();
if (!options.form) {
  const stepOptions = useStepOptions();
  width.value = stepOptions.width;
  height.value = stepOptions.height;
}
</script>
