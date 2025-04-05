<template>
  <template v-if="isForm">
    <form-color-input-row
      v-model="fill"
      option-name="fill"
      :label="$t('Fill color').toString()"
      :has-multiple-values="hasMultipleValues"
      can-be-transparent
    />
    <form-color-input-row
      v-model="stroke"
      option-name="stroke"
      :label="$t('Stroke color').toString()"
      :has-multiple-values="hasMultipleValues"
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

const { stepNumber = undefined, hasMultipleValues = false } = defineProps<{
  stepNumber?: number;
  hasMultipleValues?: boolean;
}>();

const isForm = computed(() => stepNumber !== undefined);

const x = defineModel<number>({ default: 5 });
const y = defineModel<number>({ default: 5 });
const width = defineModel<number>({ default: 15 });
const height = defineModel<number>({ default: 15 });
const fill = defineModel<string>({ default: "#ff0000" });
const stroke = defineModel<string>({ default: "transparent" });

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(rect.value!, {
      coords: () => ({ x: x.value, y: y.value }),
    });
  }
});
</script>
