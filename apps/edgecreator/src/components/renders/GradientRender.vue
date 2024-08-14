<template>
  <svg>
    <g>
      <defs>
        <linearGradient
          :id="gradientId"
          x1="0%"
          y1="0%"
          :x2="options.direction === 'Vertical' ? '0%' : '100%'"
          :y2="options.direction === 'Vertical' ? '100%' : '0%'"
        >
          <stop
            offset="0%"
            :style="{ 'stop-color': options.colorStart, 'stop-opacity': 1 }"
          />
          <stop
            offset="100%"
            :style="{ 'stop-color': options.colorEnd, 'stop-opacity': 1 }"
          />
        </linearGradient>
      </defs>
      <rect
        ref="rect"
        v-bind="attributes"
        :fill="`url(#${gradientId})`"
      >
        <metadata>{{ options }}</metadata>
      </rect>
    </g>
  </svg>
</template>

<script setup lang="ts">
const rect = ref<SVGRectElement | null>(null);

interface Props {
  issuecode: string;
  stepNumber: number;
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    colorStart: string;
    colorEnd: string;
    direction: string;
  };
}
const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    x: 3,
    y: 3,
    width: 10,
    height: 80,
    colorStart: "#D01721",
    colorEnd: "#0000FF",
    direction: "Vertical",
  }),
});

const gradientId = computed(() => btoa(JSON.stringify(props.options)));

const { enableDragResize, attributes } = useStepOptions(props, [
  "x",
  "y",
  "width",
  "height",
]);

onMounted(() => {
  enableDragResize(rect.value!);
});
</script>
