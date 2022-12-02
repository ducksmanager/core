<template>
  <LinkToCollectionIfNoIssue />
  <BButtonGroup>
    <BButton
      v-for="(text, unitType) in unitTypes"
      :key="unitType"
      :pressed="unitTypeCurrent === unitType"
      @click="unitTypeCurrent = unitType"
    >
      {{ text }}
    </BButton>
  </BButtonGroup>
  <div class="wrapper">
    <bar v-if="chartData" :chart-data="chartData" :chart-options="options" />
  </div>
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
import { onMounted, watch } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";
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

let height = $ref(400);

const { t: $t } = useI18n(),
  totalPerPublicationUniqueIssueNumbers = $computed(
    () => collectionStore().totalPerPublicationUniqueIssueNumbers
  ),
  unitTypes = {
    number: $t("Afficher en valeurs réelles"),
    percentage: $t("Afficher en pourcentages"),
  },
  countryNames = $computed(() => coa().countryNames),
  issueCounts = $computed(() => coa().issueCounts),
  publicationNames = $computed(() => coa().publicationNames),
  labels = $computed(
    () =>
      totalPerPublicationUniqueIssueNumbers &&
      Object.keys(totalPerPublicationUniqueIssueNumbers)
  ),
  values = $computed(() => {
    if (
      !(totalPerPublicationUniqueIssueNumbers && issueCounts && countryNames)
    ) {
      return null;
    }
    let possessedIssues = Object.values(totalPerPublicationUniqueIssueNumbers);
    let missingIssues = Object.keys(totalPerPublicationUniqueIssueNumbers).map(
      (publicationCode) =>
        issueCounts[publicationCode] -
        totalPerPublicationUniqueIssueNumbers[publicationCode]
    );
    if (unitTypeCurrent === "percentage") {
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

let chartData = $ref(null),
  unitTypeCurrent = $ref("number"),
  options = $ref({});

watch(
  () => totalPerPublicationUniqueIssueNumbers,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    await fetchCountryNames();
    await fetchPublicationNames(Object.keys(newValue));
    await fetchIssueCounts();
  },
  { immediate: true }
);

watch(
  () => labels,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    height = `${100 + 30 * newValue.length}px`;
  },
  { immediate: true }
);

watch(
  () => values,
  async (newValue) => {
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
        indexAxis: "y",
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: unitTypeCurrent === "percentage" ? 100 : undefined,
            stacked: true,
            ticks: {
              stepSize: 1,
              callback: (value) =>
                unitTypeCurrent === "percentage" ? `${value}%` : value,
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
                  unitTypeCurrent === "percentage" ? "%" : ""
                }`,
            },
          },
        },
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await collectionStore().loadCollection();
});
</script>

<style scoped lang="scss">
:deep(.btn) {
  &:focus {
    box-shadow: none !important;
  }
}
.wrapper {
  height: v-bind(height);

  > div {
    width: 100%;
    height: 100%;
  }

  :deep(canvas) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
