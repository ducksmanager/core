<template>
  <PieChart v-if="chartData" :chart-data="chartData" :options="options" />
</template>

<script setup>
import {
  ArcElement,
  Chart,
  Legend,
  PieController,
  Title,
  Tooltip,
} from "chart.js";
import { watch } from "vue";
import { PieChart } from "vue-chart-3";
import { useI18n } from "vue-i18n";

import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

collection().loadCollection();
const { t: $t } = useI18n(),
  totalPerPublication = $computed(() => collection().totalPerPublication),
  publicationNames = $computed(() => coa().publicationNames),
  smallCountPublications = $computed(() =>
    !totalPerPublication
      ? null
      : Object.keys(totalPerPublication).filter(
          (publicationCode) =>
            totalPerPublication[publicationCode] /
              collection().collection.length <
            0.01
        )
  ),
  totalPerPublicationGroupSmallCounts = $computed(
    () =>
      smallCountPublications && {
        ...Object.keys(totalPerPublication)
          .filter(
            (publicationCode) =>
              !smallCountPublications.includes(publicationCode)
          )
          .reduce(
            (acc, publicationCode) => ({
              ...acc,
              [publicationCode]: totalPerPublication[publicationCode],
            }),
            {}
          ),
        [null]: smallCountPublications.reduce(
          (acc, publicationCode) => acc + totalPerPublication[publicationCode],
          0
        ),
      }
  ),
  labels = $computed(
    () =>
      hasPublicationNames &&
      Object.keys(totalPerPublicationGroupSmallCounts)
        .sort(sortByCount)
        .reduce(
          (acc, publicationCode) => [
            ...acc,
            publicationNames[publicationCode] ||
              `${$t("Autres")} (${smallCountPublications.length} ${$t(
                "Publications"
              ).toLowerCase()})`,
          ],
          []
        )
  ),
  values = $computed(() =>
    Object.values(totalPerPublicationGroupSmallCounts).sort((count1, count2) =>
      Math.sign(count1 - count2)
    )
  ),
  colors = $computed(
    () =>
      totalPerPublicationGroupSmallCounts &&
      Object.keys(totalPerPublicationGroupSmallCounts)
        .sort(sortByCount)
        .map((publicationCode) =>
          publicationCode === "null" ? "#000" : randomColor()
        )
  ),
  fetchPublicationNames = coa().fetchPublicationNames,
  randomColor = () =>
    `rgb(${[
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ].join(",")})`,
  sortByCount = (publicationCode1, publicationCode2) =>
    Math.sign(
      totalPerPublicationGroupSmallCounts[publicationCode1] -
        totalPerPublicationGroupSmallCounts[publicationCode2]
    );

let hasPublicationNames = $ref(false),
  chartData = $ref(null),
  options = $ref({});

watch(
  () => totalPerPublicationGroupSmallCounts,
  (newValue) => {
    if (newValue) {
      fetchPublicationNames(
        Object.keys(totalPerPublicationGroupSmallCounts).filter(
          (publicationCode) => publicationCode !== "null"
        )
      );
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

watch(
  () => labels,
  () => {
    chartData = {
      datasets: [
        {
          data: values,
          backgroundColor: colors,
        },
      ],
      labels: labels,
    };

    options = {
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
            title: ([tooltipItem]) => chartData.labels[tooltipItem.dataIndex],
          },
        },
      },
    };
  },
  { immediate: true }
);
</script>

<style scoped>

</style>
