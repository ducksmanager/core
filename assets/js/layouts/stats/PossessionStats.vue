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
import { ref } from "vue";
import { computed, watch } from "vue";
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

const props = defineProps({
  unit: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["change-dimension"]);

collection();

const { t: $t } = useI18n(),
  chartData = ref(null),
  options = ref({}),
  totalPerPublicationUniqueIssueNumbers = computed(
    () => collectionStore().totalPerPublicationUniqueIssueNumbers
  ),
  countryNames = computed(() => coa().countryNames),
  issueCounts = computed(() => coa().issueCounts),
  publicationNames = computed(() => coa().publicationNames),
  labels = computed(() =>
    Object.keys(totalPerPublicationUniqueIssueNumbers.value)
  ),
  values = computed(() => {
    if (
      !(
        totalPerPublicationUniqueIssueNumbers.value &&
        issueCounts.value &&
        countryNames.value
      )
    ) {
      return null;
    }
    let possessedIssues = Object.values(
      totalPerPublicationUniqueIssueNumbers.value
    );
    let missingIssues = Object.keys(
      totalPerPublicationUniqueIssueNumbers.value
    ).map(
      (publicationCode) =>
        issueCounts.value[publicationCode] -
        totalPerPublicationUniqueIssueNumbers.value[publicationCode]
    );
    if (props.unit.value === "percentage") {
      possessedIssues = possessedIssues.map((possessedCount, key) =>
        Math.round(
          possessedCount * (100 / (possessedCount + missingIssues[key]))
        )
      );
      missingIssues = possessedIssues.map(
        (possessedCount) => 100 - possessedCount
      );
    }
    return [possessedIssues, missingIssues];
  }),
  fetchCountryNames = coa().fetchCountryNames,
  fetchPublicationNames = coa().fetchPublicationNames,
  fetchIssueCounts = coa().fetchIssueCounts;

watch(
  () => totalPerPublicationUniqueIssueNumbers.value,
  async (newValue) => {
    await fetchCountryNames();
    await fetchPublicationNames(Object.keys(newValue));
    await fetchIssueCounts();
  },
  { immediate: true }
);

watch(
  () => labels.value,
  async (newValue) => {
    emit("change-dimension", "height", 100 + 30 * newValue.length);
    emit("change-dimension", "width", 500);
  },
  { immediate: true }
);

watch(
  () => values.value,
  async (newValue) => {
    if (newValue) {
      chartData.value = {
        datasets: [
          {
            data: values.value[0],
            backgroundColor: "green",
            label: $t("Numéros possédés"),
            legend: $t("Numéros possédés"),
          },
          {
            data: values.value[1],
            backgroundColor: "orange",
            label: $t("Numéros référencés non-possédés"),
            legend: $t("Numéros référencés non-possédés"),
          },
        ],
        labels: labels.value,
        legends: [
          $t("Numéros possédés"),
          $t("Numéros référencés non-possédés"),
        ],
      };

      options.value = {
        responsive: true,
        indexAxis: "y",
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: props.unit === "percentage" ? 100 : undefined,
            stacked: true,
            ticks: {
              stepSize: 1,
              callback: (value) =>
                props.unit === "percentage" ? `${value}%` : value,
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
                if (!publicationNames.value[publicationcode]) {
                  publicationNames.value[publicationcode] = "?";
                }
                return `${publicationNames.value[publicationcode] || "?"} (${
                  countryNames.value[publicationcode.split("/")[0]]
                })`;
              },
              label: (tooltipItem) =>
                `${tooltipItem.dataset.label}: ${tooltipItem.raw}${
                  props.unit === "percentage" ? "%" : ""
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
