<template>
  <form-color-input-row
    v-if="isForm"
    v-model="fill"
    option-name="fill"
    :label="$t('Fill color').toString()"
    :has-multiple-values="hasMultipleValues"
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

const { stepNumber = undefined, hasMultipleValues = false } = defineProps<{
  stepNumber?: number;
  hasMultipleValues?: boolean;
}>();

const isForm = computed(() => stepNumber !== undefined);

const fill = defineModel<string>({ default: "#ff0000" });

const width = ref();
const height = ref();
if (!isForm.value) {
  const stepOptions = useStepOptions();
  width.value = stepOptions.width;
  height.value = stepOptions.height;
}
</script>
