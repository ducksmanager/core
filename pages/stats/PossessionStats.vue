<template>
  <BarChart v-if="chartData" :chart-data="chartData" :options="options" />
</template>

<script setup>
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { watch } from "vue";
import { BarChart } from "vue-chart-3";
import { useI18n } from "vue-i18n";

import { collection } from "../../composables/collection";
import { coa } from "../../stores/coa";
import { collection as collectionStore } from "../../stores/collection";
Chart.register(
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
  BarController,
  Tooltip,
  Title,
  ArcElement
);
const { unit } = defineProps({
  unit: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["change-dimension"]);
collection();

const { t: $t } = useI18n();
const totalPerPublicationUniqueIssueNumbers = $computed(
  () => collectionStore().totalPerPublicationUniqueIssueNumbers
);
const countryNames = $computed(() => coa().countryNames);
const issueCounts = $computed(() => coa().issueCounts);
const publicationNames = $computed(() => coa().publicationNames);
const labels = $computed(() =>
  Object.keys(totalPerPublicationUniqueIssueNumbers)
);
const values = $computed(() => {
  if (!(totalPerPublicationUniqueIssueNumbers && issueCounts && countryNames)) {
    return null;
  }
  let possessedIssues = Object.values(totalPerPublicationUniqueIssueNumbers);
  let missingIssues = Object.keys(totalPerPublicationUniqueIssueNumbers).map(
    (publicationCode) =>
      issueCounts[publicationCode] -
      totalPerPublicationUniqueIssueNumbers[publicationCode]
  );
  if (unit === "percentage") {
    possessedIssues = possessedIssues.map((possessedCount, key) =>
      Math.round(possessedCount * (100 / (possessedCount + missingIssues[key])))
    );
    missingIssues = possessedIssues.map(
      (possessedCount) => 100 - possessedCount
    );
  }
  return [possessedIssues, missingIssues];
});
const fetchCountryNames = coa().fetchCountryNames;
const fetchPublicationNames = coa().fetchPublicationNames;
const fetchIssueCounts = coa().fetchIssueCounts;

let chartData = $ref(null);
let options = $ref({});

watch(
  () => totalPerPublicationUniqueIssueNumbers,
  async (newValue) => {
    await fetchCountryNames();
    await fetchPublicationNames(Object.keys(newValue));
    await fetchIssueCounts();
  },
  { immediate: true }
);

watch(
  () => labels,
  (newValue) => {
    emit("change-dimension", "height", 100 + 30 * newValue.length);
    emit("change-dimension", "width", 500);
  },
  { immediate: true }
);

watch(
  () => values,
  (newValue) => {
    if (newValue) {
      chartData = {
        datasets: [
          {
            data: values[0],
            backgroundColor: "green",
            label: $t("Numéros possédés"),
            legend: $t("Numéros possédés"),
          },
          {
            data: values[1],
            backgroundColor: "orange",
            label: $t("Numéros référencés non-possédés"),
            legend: $t("Numéros référencés non-possédés"),
          },
        ],
        labels,
        legends: [
          $t("Numéros possédés"),
          $t("Numéros référencés non-possédés"),
        ],
      };

      options = {
        responsive: true,
        indexAxis: "y",
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: unit === "percentage" ? 100 : undefined,
            stacked: true,
            ticks: {
              stepSize: 1,
              callback: (value) =>
                unit === "percentage" ? `${value}%` : value,
            },
          },
          y: {
            stacked: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: $t("Possession des numéros"),
          },
          tooltip: {
            enabled: true,
            position: "nearest",
            mode: "index",
            axis: "y",
            intersect: false,
            callbacks: {
              title: ([tooltipItem]) => {
                const publicationcode = tooltipItem.label;
                if (!publicationNames[publicationcode]) {
                  publicationNames[publicationcode] = "?";
                }
                return `${publicationNames[publicationcode] || "?"} (${
                  countryNames[publicationcode.split("/")[0]]
                })`;
              },
              label: (tooltipItem) =>
                `${tooltipItem.dataset.label}: ${tooltipItem.raw}${
                  unit === "percentage" ? "%" : ""
                }`,
            },
          },
        },
      };
    }
  },
  { immediate: true }
);
</script>

<style scoped>
</style>
