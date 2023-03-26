<template>
  <LinkToCollectionIfNoIssue />
  <pie :chart-data="chartData" :chart-options="options" />
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

import condition from "~/composables/useCondition";
import { collection as collectionStore } from "~/stores/collection";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

let conditions;

conditions = condition().conditions;
const numberPerCondition = $computed(
  () =>
    collectionStore().collection?.reduce(
      (acc, { condition }) => ({
        ...acc,
        [condition || "indefini"]: (acc[condition || "indefini"] || 0) + 1,
      }),
      {} as { [condition: string]: number }
    ) || {}
);
const conditionsWithoutMissing = conditions.filter(
  ({ value }) => value !== null
);
const values = $computed(() =>
  Object.values(conditionsWithoutMissing).map(
    ({ dbValue }) => numberPerCondition[dbValue!]
  )
);
const colors = Object.values(
  conditionsWithoutMissing.map(({ color }) => color)
);
const chartData = $computed(() => ({
  labels: Object.values(conditionsWithoutMissing).map(({ text }) => text),
  datasets: [
    {
      data: values,
      backgroundColor: colors,
    },
  ],
}));
const options = $computed(
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
            const total = dataset.data.reduce((acc, value) => acc + value, 0);
            const percentage = parseFloat(
              ((currentValue / total) * 100).toFixed(1)
            );
            return `${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  })
);

collectionStore().loadCollection();
</script>

<style scoped>

</style>
