<template>
  <PieChart v-if="chartData" :chart-data="chartData" :options="options" />
</template>

<script setup>
import { mapActions, mapState } from "pinia";
import { coa } from "../../stores/coa";
const { collection } = require("../../stores/collection");
import { PieChart } from "vue-chart-3";

import {
  ArcElement,
  Chart,
  Legend,
  PieController,
  Title,
  Tooltip,
} from "chart.js";
import { computed, watch } from "vue";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

collection().loadCollection();

const hasPublicationNames = ref(false),
  chartData = ref(null),
  options = ref({}),
  totalPerPublication = computed(() => collection().totalPerPublication),
  publicationNames = computed(() => coa().publicationNames),
  smallCountPublications = computed(() => {
    if (!totalPerPublication.value) {
      return null;
    }
    return Object.keys(totalPerPublication.value).filter(
      (publicationCode) =>
        totalPerPublication.value[publicationCode] /
          collection().collection.length <
        0.01
    );
  }),
  totalPerPublicationGroupSmallCounts = () => {
    return (
      smallCountPublications.value && {
        ...Object.keys(totalPerPublication.value)
          .filter(
            (publicationCode) =>
              !smallCountPublications.value.includes(publicationCode)
          )
          .reduce(
            (acc, publicationCode) => ({
              ...acc,
              [publicationCode]: totalPerPublication.value[publicationCode],
            }),
            {}
          ),
        [null]: smallCountPublications.value.reduce((acc, publicationCode) => {
          return acc + totalPerPublication.value[publicationCode];
        }, 0),
      }
    );
  },
  labels = computed(() => {
    return (
      hasPublicationNames.value &&
      Object.keys(totalPerPublicationGroupSmallCounts.value)
        .sort(sortByCount.value)
        .reduce(
          (acc, publicationCode) => [
            ...acc,
            publicationNames.value[publicationCode] ||
              `${this.$t("Autres")} (${
                this.smallCountPublications.length
              } ${this.$t("Publications").toLowerCase()})`,
          ],
          []
        )
    );
  }),
  values = computed(() =>
    Object.values(totalPerPublicationGroupSmallCounts.value).sort(
      (count1, count2) => Math.sign(count1 - count2)
    )
  ),
  colors = computed(() => {
    return (
      totalPerPublicationGroupSmallCounts.value &&
      Object.keys(totalPerPublicationGroupSmallCounts.value)
        .sort(sortByCount.value)
        .map((publicationCode) =>
          publicationCode === "null" ? "#000" : randomColor()
        )
    );
  }),
  fetchPublicationNames = coa().fetchPublicationNames,
  randomColor = () =>
    `rgb(${[
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ].join(",")})`,
  sortByCount = (publicationCode1, publicationCode2) =>
    Math.sign(
      totalPerPublicationGroupSmallCounts.value[publicationCode1] -
        totalPerPublicationGroupSmallCounts.value[publicationCode2]
    );

watch(
  () => totalPerPublicationGroupSmallCounts.value,
  (newValue) => {
    if (newValue) {
      this.fetchPublicationNames(
        Object.keys(totalPerPublicationGroupSmallCounts.value).filter(
          (publicationCode) => publicationCode !== "null"
        )
      );
      this.hasPublicationNames = true;
    }
  },
  { immediate: true }
);

watch(
  () => labels.value,
  () => {
    chartData.value = {
      datasets: [
        {
          data: values.value,
          backgroundColor: colors.value,
        },
      ],
      labels: labels.value,
    };

    options.value = {
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
    };
  }
);
</script>

<style scoped>

</style>
