<template>
  <template v-if="isForm">
    <form-color-input-row
      v-model="fill"
      option-name="fill"
      :label="$t(ucFirst(`fill color`)).toString()"
      :has-multiple-values="hasMultipleValues"
      can-be-transparent
    />
    <form-color-input-row
      v-model="stroke"
      option-name="stroke"
      :label="$t(ucFirst(`stroke color`)).toString()"
      :has-multiple-values="hasMultipleValues"
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
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

const { zoom } = storeToRefs(ui());

const { stepNumber = undefined, hasMultipleValues = false } = defineProps<{
  stepNumber?: number;
  hasMultipleValues?: boolean;
}>();

const cx = defineModel<number>({ default: 5 });
const cy = defineModel<number>({ default: 5 });
const rx = defineModel<number>({ default: 10 });
const ry = defineModel<number>({ default: 10 });
const fill = defineModel<string>({ default: "#000000" });
const stroke = defineModel<string>({ default: "#ff0000" });

const isForm = computed(() => stepNumber !== undefined);

const ellipse = ref<HTMLElement>();

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(ellipse.value!, {
      onmove: ({ dx, dy }) => {
        step().setOptionValues({
          cx: cx.value + dx / zoom.value,
          cy: cy.value + dy / zoom.value,
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
