<template>
  <template v-if="isForm">
    <form-color-input-row
      v-for="optionName in ['colorStart', 'colorEnd']"
      :key="optionName"
      v-model="colorStart"
      option-name="colorStart"
      :label="
        $t(optionName === 'colorStart' ? 'Start color' : 'End color').toString()
      "
      :is-multiple="isMultiple"
    />

    <form-input-row
      v-model="direction"
      type="select"
      option-name="direction"
      :label="$t('Direction').toString()"
      :select-options="[$t('Vertical'), $t('Horizontal')]"
      :is-multiple="isMultiple"
    />
  </template>
  <svg v-else>
    <g>
      <defs>
        <linearGradient
          :id="gradientId"
          x1="0%"
          y1="0%"
          :x2="direction === 'Vertical' ? '0%' : '100%'"
          :y2="direction === 'Vertical' ? '100%' : '0%'"
        >
          <stop
            offset="0%"
            :style="{ 'stop-color': colorStart, 'stop-opacity': 1 }"
          />
          <stop
            offset="100%"
            :style="{ 'stop-color': colorEnd, 'stop-opacity': 1 }"
          />
        </linearGradient>
      </defs>
      <rect
        ref="rect"
        v-bind="{ x, y, width, height }"
        :fill="`url(#${gradientId})`"
      >
        <metadata>{{ $props }}</metadata>
      </rect>
    </g>
  </svg>
</template>

<script setup lang="ts">
const rect = ref<SVGRectElement>();

const { stepNumber = undefined, isMultiple = false } = defineProps<{
  stepNumber?: number;
  isMultiple?: boolean;
}>();

provide("stepNumber", stepNumber);

const isForm = computed(() => stepNumber !== undefined);

const x = defineModel<number>("x", { default: 3 });
const y = defineModel<number>("y", { default: 3 });
const width = defineModel<number>("width", { default: 10 });
const height = defineModel<number>("height", { default: 80 });
const colorStart = defineModel<string>("colorStart", { default: "#D01721" });
const colorEnd = defineModel<string>("colorEnd", { default: "#0000FF" });
const direction = defineModel<"Vertical" | "Horizontal">("direction", {
  default: "Vertical",
});

const gradientId = computed(() =>
  btoa(
    JSON.stringify({ x, y, width, height, colorStart, colorEnd, direction }),
  ),
);

onMounted(() => {
  if (!isForm.value) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(rect.value!, {
      coords: () => ({ x: x.value, y: y.value }),
    });
  }
});
</script>
