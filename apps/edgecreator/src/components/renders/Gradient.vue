<template>
  <template v-if="form">
    <form-color-input-row
      v-for="optionName in ['colorStart', 'colorEnd']"
      :key="optionName"
      :input-values="form"
      :option-name="optionName"
      :label="
        $t(optionName === 'colorStart' ? 'Start color' : 'End color').toString()
      "
    />

    <form-input-row
      type="select"
      :input-values="form.direction"
      option-name="direction"
      :label="$t('Direction').toString()"
      :select-options="[$t('Vertical'), $t('Horizontal')]"
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
      <rect ref="rect" v-bind="options" :fill="`url(#${gradientId})`">
        <metadata>{{ options }}</metadata>
      </rect>
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { RenderOrForm } from "./RenderOrForm";

const rect = ref<SVGRectElement>();

const options = withDefaults(
  defineProps<
    RenderOrForm<{
      x: number;
      y: number;
      width: number;
      height: number;
      colorStart: string;
      colorEnd: string;
      direction: "Vertical" | "Horizontal";
    }>
  >(),
  {
    x: 3,
    y: 3,
    width: 10,
    height: 80,
    colorStart: "#D01721",
    colorEnd: "#0000FF",
    direction: "Vertical",
  },
);

const gradientId = computed(() => btoa(JSON.stringify(options)));

onMounted(() => {
  if (!options.form) {
    const { enableDragResize } = useStepOptions();
    enableDragResize(rect.value!, {
      coords: () => ({ x: options.x, y: options.y }),
    });
  }
});
</script>
