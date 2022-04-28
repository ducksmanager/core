<template>
  <PieChart :chart-data="chartData" :options="options" />
</template>
<script setup>
import { collection } from "../../composables/collection";
import { condition } from "../../composables/condition";
const { collection: collectionStore } = require("../../stores/collection");
import { PieChart } from "vue-chart-3";

import {
  ArcElement,
  Chart,
  Legend,
  PieController,
  Title,
  Tooltip,
} from "chart.js";
import { computed } from "vue";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

let conditions;

conditions = condition().conditions;
collection().load();

const conditionsWithoutMissing = () =>
    conditions.filter(({ value }) => value !== "missing"),
  values = () => {
    const numberPerCondition = collectionStore().collection.reduce(
      (acc, { condition }) => ({
        ...acc,
        [condition || "indefini"]: (acc[condition || "indefini"] || 0) + 1,
      }),
      {}
    );
    return Object.values(conditionsWithoutMissing.value).map(
      ({ dbValue }) => numberPerCondition[dbValue]
    );
  },
  colors = () =>
    Object.values(conditionsWithoutMissing.value.map(({ color }) => color)),
  chartData = computed(() => ({
    labels: Object.values(conditionsWithoutMissing.value).map(
      ({ text }) => text
    ),
    datasets: [
      {
        data: values.value,
        backgroundColor: colors.value,
      },
    ],
  })),
  options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const { dataset, parsed: currentValue } = tooltipItem;
            const total = dataset.data.reduce((acc, value) => acc + value, 0);
            const percentage = parseFloat(
              ((currentValue / total) * 100).toFixed(1)
            );
            return `${currentValue} (${percentage}%)`;
          },
          title: ([tooltipItem]) =>
            chartData.value.labels[tooltipItem.dataIndex],
        },
      },
    },
  }));
</script>

<style scoped>

</style>
