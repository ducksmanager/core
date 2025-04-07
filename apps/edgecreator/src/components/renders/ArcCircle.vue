<template>
  <template v-if="isForm">
    <form-color-input-row
      v-model="fill"
      option-name="fill"
      :label="$t(ucFirst(`fill color`)).toString()"
      :is-multiple="isMultiple"
      can-be-transparent
    />
    <form-color-input-row
      v-model="stroke"
      option-name="stroke"
      :label="$t(ucFirst(`stroke color`)).toString()"
      :is-multiple="isMultiple"
      can-be-transparent
    />
  </template>
  <svg v-else>
    <ellipse ref="ellipse" v-bind="{ cx, cy, rx, ry, fill, stroke }">
      <metadata>{{ $props }}</metadata>
    </ellipse>
  </svg>
</template>

<script setup lang="ts">
import { ui } from "~/stores/ui";

const { zoom } = storeToRefs(ui());

const { stepNumber = undefined, isMultiple = false } = defineProps<{
  stepNumber?: number;
  isMultiple?: boolean;
}>();

provide("stepNumber", stepNumber);

const cx = defineModel<number>("cx", { default: 5 });
const cy = defineModel<number>("cy", { default: 5 });
const rx = defineModel<number>("rx", { default: 10 });
const ry = defineModel<number>("ry", { default: 10 });
const fill = defineModel<string>("fill", { default: "#000000" });
const stroke = defineModel<string>("stroke", { default: "#ff0000" });

const isForm = computed(() => stepNumber !== undefined);

const ellipse = ref<HTMLElement>();

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(ellipse.value!, {
      onmove: ({ dx, dy }) => {
        cx.value += dx / zoom.value;
        cy.value += dy / zoom.value;
      },
      onresizemove: ({ rect }) => {
        rx.value = rect.width / 2 / zoom.value;
        ry.value = rect.height / 2 / zoom.value;
      },
    });
  }
});
</script>
