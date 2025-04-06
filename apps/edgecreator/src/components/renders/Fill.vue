<template>
  <form-color-input-row
    v-if="isForm"
    v-model="fill"
    option-name="fill"
    :label="$t('Fill color').toString()"
    :is-multiple="isMultiple"
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
import { step } from "~/stores/step";

const { getFilteredDimensions } = step();

const { stepNumber = undefined, isMultiple = false } = defineProps<{
  stepNumber?: number;
  isMultiple?: boolean;
}>();

provide("stepNumber", stepNumber);

const isForm = computed(() => stepNumber !== undefined);

const fill = defineModel<string>("fill", { default: "#ff0000" });

const width = ref();
const height = ref();

watch(
  isForm,
  (isForm) => {
    if (!isForm) {
      const issuecode = inject<string>("issuecode")!;
      watch(
        () =>
          getFilteredDimensions({
            issuecodes: [issuecode],
          })[0],
        (issueDimensions) => {
          width.value = issueDimensions.width;
          height.value = issueDimensions.height;
        },
        { immediate: true },
      );
    }
  },
  { immediate: true },
);
</script>
