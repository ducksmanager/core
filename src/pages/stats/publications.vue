<template>
  <LinkToCollectionIfNoIssue />
  <pie v-if="chartData" :chart-data="chartData" :chart-options="options" />
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
import { Pie } from "vue-chartjs";
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

collection().loadCollection();
const { t: $t } = useI18n();
const totalPerPublication = $computed(() => collection().totalPerPublication);
const publicationNames = $computed(() => coa().publicationNames);
const smallCountPublications = $computed(() =>
  !totalPerPublication
    ? null
    : Object.keys(totalPerPublication).filter(
        (publicationCode) =>
          totalPerPublication[publicationCode] /
            collection().collection.length <
          0.01
      )
);
const totalPerPublicationGroupSmallCounts = $computed(
  () =>
    smallCountPublications &&
    totalPerPublication && {
      ...Object.keys(totalPerPublication)
        .filter(
          (publicationCode) => !smallCountPublications.includes(publicationCode)
        )
        .reduce(
          (acc, publicationCode) => ({
            ...acc,
            [publicationCode]: totalPerPublication[publicationCode],
          }),
          {}
        ),
      ...(!smallCountPublications.length
        ? {}
        : {
            [null]: smallCountPublications.reduce(
              (acc, publicationCode) =>
                acc + totalPerPublication[publicationCode],
              0
            ),
          }),
    }
);
const labels = $computed(
  () =>
    hasPublicationNames &&
    Object.entries(totalPerPublicationGroupSmallCounts)
      .sort(sortByCount)
      .reduce(
        (acc, [publicationCode]) => [
          ...acc,
          publicationNames[publicationCode] ||
            `${$t("Autres")} (${smallCountPublications.length} ${$t(
              "Publications"
            ).toLowerCase()})`,
        ],
        []
      )
);
const values = $computed(() =>
  Object.values(totalPerPublicationGroupSmallCounts).sort((count1, count2) =>
    Math.sign(count1 - count2)
  )
);
const colors = $computed(
  () =>
    totalPerPublicationGroupSmallCounts &&
    Object.entries(totalPerPublicationGroupSmallCounts)
      .sort(sortByCount)
      .map(([publicationCode]) =>
        publicationCode === "null" ? "#000" : randomColor()
      )
);
const fetchPublicationNames = coa().fetchPublicationNames;
const randomColor = () =>
  `rgb(${[
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ].join(",")})`;
const sortByCount = ([publicationCode1], [publicationCode2]) =>
  Math.sign(
    totalPerPublicationGroupSmallCounts[publicationCode1] -
      totalPerPublicationGroupSmallCounts[publicationCode2]
  );

let hasPublicationNames = $ref(false);
let chartData = $ref(null);
let options = $ref({});

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
  () => labels && values && colors,
  (newValue) => {
    if (!newValue) {
      return;
    }
    chartData = {
      datasets: [
        {
          data: values,
          backgroundColor: colors,
        },
      ],
      labels,
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
