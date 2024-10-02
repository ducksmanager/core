<template>
  <LinkToCollectionIfNoIssue />
  <b-button-group>
    <b-button
      v-for="(text, unitType) in unitTypes"
      :key="unitType"
      :pressed="unitTypeCurrent === unitType"
      @click="unitTypeCurrent = unitType"
    >
      {{ text }}
    </b-button>
  </b-button-group>
  <div class="wrapper">
    <bar v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from "chart.js";
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
import { Bar } from "vue-chartjs";
Chart.register(
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
  BarController,
  Tooltip,
  Title,
  ArcElement,
);

let height = $ref<string>("400px");
let hasCoaData = $ref(false);
let chartData = $ref<ChartData<"bar", number[]> | null>(null),
  unitTypeCurrent = $ref<string>("number"),
  options = $ref<ChartOptions<"bar">>({});

const { loadCollection } = collection();
const {
  totalPerPublicationUniqueIssuecodesSorted,
  coaIssueCountsByPublicationcode,
} = storeToRefs(collection());

const { fetchPublicationNames } = coa();
const { publicationNames } = storeToRefs(coa());

const { t: $t } = useI18n(),
  unitTypes = {
    number: $t("Afficher en valeurs réelles"),
    percentage: $t("Afficher en pourcentages"),
  },
  labels = $computed(
    () =>
      hasCoaData &&
      totalPerPublicationUniqueIssuecodesSorted.value?.map(
        ([publicationcode]) => publicationNames.value[publicationcode],
      ),
  ),
  values = $computed(() => {
    if (
      !(
        totalPerPublicationUniqueIssuecodesSorted.value &&
        coaIssueCountsByPublicationcode &&
        hasCoaData
      )
    ) {
      return null;
    }
    let possessedIssues = totalPerPublicationUniqueIssuecodesSorted.value.map(
      ([, userIssueCount]) => userIssueCount,
    );
    let missingIssues = totalPerPublicationUniqueIssuecodesSorted.value.map(
      ([publicationcode, userIssueCount]) =>
        coaIssueCountsByPublicationcode.value![publicationcode] -
        userIssueCount,
    );
    if (unitTypeCurrent === "percentage") {
      possessedIssues = possessedIssues.map((possessedCount, key) =>
        Math.round(
          possessedCount * (100 / (possessedCount + missingIssues[key])),
        ),
      );
      missingIssues = possessedIssues.map(
        (possessedCount) => 100 - possessedCount,
      );
    }
    return [possessedIssues, missingIssues];
  });

watch(
  totalPerPublicationUniqueIssuecodesSorted,
  async (newValue) => {
    if (!newValue?.length) {
      return;
    }
    await fetchPublicationNames(
      newValue.map(([publicationcode]) => publicationcode),
    );
    hasCoaData = true;
  },
  { immediate: true },
);

watch(
  $$(labels),
  async (newValue) => {
    if (!newValue) {
      return;
    }
    height = `${100 + 30 * newValue.length}px`;
  },
  { immediate: true },
);

watch(
  $$(values),
  async (newValue) => {
    if (newValue) {
      chartData = {
        datasets: [
          {
            data: values![0],
            backgroundColor: "green",
            label: $t("Numéros possédés"),
          },
          {
            data: values![1],
            backgroundColor: "orange",
            label: $t("Numéros référencés non-possédés"),
          },
        ],
        labels,
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
              color: "white",
              callback: (value) =>
                unitTypeCurrent === "percentage" ? `${value}%` : value,
            },
          },
          y: {
            stacked: true,
            ticks: {
              color: "white",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "white",
            },
          },
          title: {
            display: true,
            text: $t("Possession des numéros"),
            color: "white",
          },
          tooltip: {
            enabled: true,
            position: "nearest",
            mode: "index",
            axis: "y",
            intersect: false,
            callbacks: {
              title: ([tooltipItem]) => tooltipItem.label,
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
  { immediate: true },
);

loadCollection();
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
