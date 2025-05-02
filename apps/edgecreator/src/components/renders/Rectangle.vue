<template>
  <template v-if="isForm">
    <form-color-input-row
      v-model="fill"
      option-name="fill"
      :label="$t('Fill color').toString()"
      can-be-transparent
    />
    <form-color-input-row
      v-model="stroke"
      option-name="stroke"
      :label="$t('Stroke color').toString()"
      can-be-transparent
    />
  </template>
  <svg v-else>
    <rect ref="rect" v-bind="{ x, y, width, height, fill, stroke }">
      <metadata>{{ $props }}</metadata>
    </rect>
  </svg>
</template>

<script setup lang="ts">
const rect = ref<SVGRectElement>();

const { stepNumber = undefined } = defineProps<{
  stepNumber?: number;
}>();

provide("stepNumber", stepNumber);

const isForm = computed(() => stepNumber !== undefined);

const x = defineModel<number>("x", { default: 5 });
const y = defineModel<number>("y", { default: 5 });
const width = defineModel<number>("width", { default: 15 });
const height = defineModel<number>("height", { default: 15 });
const fill = defineModel<string>("fill", { default: "#ff0000" });
const stroke = defineModel<string>("stroke", { default: "transparent" });

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(rect.value!, {
      coords: () => ({ x: x.value, y: y.value }),
    });
  }
});
</script>
