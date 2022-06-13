<template>
  <BarChart :chart-data="chartData" :options="options" />
</template>

<script setup>
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { BarChart } from "vue-chart-3";
import { useI18n } from "vue-i18n";

import { collection } from "../../composables/collection";
Chart.register(
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
  BarController,
  Tooltip,
  Title
);

const props = defineProps({
  unit: {
    type: String,
    required: true,
  },
  watchedAuthorsStoryCount: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["change-dimension"]);

const { t: $t } = useI18n();
collection();

const labels = Object.values(props.watchedAuthorsStoryCount).map(
  ({ fullname: fullName }) => fullName
);
emit("change-dimension", "width", 250 + 50 * labels.length);

let possessedStories = Object.values(props.watchedAuthorsStoryCount).map(
  ({ storycount: storyCount, missingstorycount: missingStoryCount }) =>
    storyCount - missingStoryCount
);
let missingStories = Object.values(props.watchedAuthorsStoryCount).map(
  ({ missingstorycount: missingStoryCount }) => missingStoryCount
);

if (props.unit === "percentage") {
  possessedStories = possessedStories.map((possessedCount, key) =>
    Math.round(possessedCount * (100 / (possessedCount + missingStories[key])))
  );
  missingStories = possessedStories.map(
    (possessedCount) => 100 - possessedCount
  );
}

const values = [possessedStories, missingStories];
const chartData = {
  datasets: [
    {
      data: values[0],
      backgroundColor: "#FF8000",
      label: $t("Histoires possédées"),
      legend: $t("Histoires possédées"),
    },
    {
      data: values[1],
      backgroundColor: "#04B404",
      label: $t("Histoires non possédées"),
      legend: $t("Histoires non possédées"),
    },
  ],
  labels,
  legends: [$t("Histoires possédées"), $t("Histoires non possédées")],
};
const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      ticks: {
        autoSkip: false,
      },
    },
    y: {
      stacked: true,
    },
  },
  plugins: {
    title: {
      display: true,
      text: $t("Possession des histoires d'auteurs"),
    },
    tooltip: {
      enabled: true,
      callbacks: {
        title: ([tooltip]) => tooltip.label,
        label: ({ dataset, raw }) =>
          `${dataset.label}: ${raw}${props.unit === "percentage" ? "%" : ""}`,
      },
    },
  },
};
</script>

<style scoped>

</style>
