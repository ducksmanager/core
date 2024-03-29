<template>
  <div class="wrapper" :style="style || {}">
    <pie :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import {
  ArcElement,
  Chart,
  ChartOptions,
  Legend,
  PieController,
  Title,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { Pie } from "vue-chartjs";

const props = defineProps<{
  conditions: { dbValue: string; color: string; text: string }[];
  numberPerCondition: Record<string, number>;
  style?: Record<string, string>;
}>();

Chart.register(Legend, PieController, Tooltip, Title, ArcElement);
const values = computed(() =>
  props.conditions.map(({ dbValue }) => props.numberPerCondition[dbValue!]),
);
const colors = props.conditions.map(({ color }) => color);
const chartData = computed(() => ({
  labels: props.conditions.map(({ text }) => text),
  datasets: [
    {
      data: values.value,
      backgroundColor: colors,
    },
  ],
}));
const options = computed(
  (): ChartOptions<"pie"> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "white",
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"pie">) => {
            const { dataset, parsed: currentValue } = tooltipItem;
            const total = dataset.data.reduce(
              (acc, value) => acc + value || 0,
              0,
            );
            const percentage = parseFloat(
              ((currentValue / total) * 100).toFixed(1),
            );
            return `${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  }),
);
</script>

<style scoped lang="scss">
.wrapper {
  max-width: 100%;
  max-height: 100%;

  :deep(canvas) {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}
</style>
