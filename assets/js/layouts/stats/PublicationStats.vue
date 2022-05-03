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
import { computed, ref, watch } from "vue";
import { PieChart } from "vue-chart-3";
import { useI18n } from "vue-i18n";

import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

collection().loadCollection();
const { t: $t } = useI18n(),
  hasPublicationNames = ref(false),
  chartData = ref(null),
  options = ref({}),
  totalPerPublication = computed(() => collection().totalPerPublication),
  publicationNames = computed(() => coa().publicationNames),
  smallCountPublications = computed(() =>
    !totalPerPublication.value
      ? null
      : Object.keys(totalPerPublication.value).filter(
          (publicationCode) =>
            totalPerPublication.value[publicationCode] /
              collection().collection.length <
            0.01
        )
  ),
  totalPerPublicationGroupSmallCounts = computed(
    () =>
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
        [null]: smallCountPublications.value.reduce(
          (acc, publicationCode) =>
            acc + totalPerPublication.value[publicationCode],
          0
        ),
      }
  ),
  labels = computed(
    () =>
      hasPublicationNames.value &&
      Object.keys(totalPerPublicationGroupSmallCounts.value)
        .sort(sortByCount.value)
        .reduce(
          (acc, publicationCode) => [
            ...acc,
            publicationNames.value[publicationCode] ||
              `${$t("Autres")} (${smallCountPublications.value.length} ${$t(
                "Publications"
              ).toLowerCase()})`,
          ],
          []
        )
  ),
  values = computed(() =>
    Object.values(totalPerPublicationGroupSmallCounts.value).sort(
      (count1, count2) => Math.sign(count1 - count2)
    )
  ),
  colors = computed(
    () =>
      totalPerPublicationGroupSmallCounts.value &&
      Object.keys(totalPerPublicationGroupSmallCounts.value)
        .sort(sortByCount.value)
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
      totalPerPublicationGroupSmallCounts.value[publicationCode1] -
        totalPerPublicationGroupSmallCounts.value[publicationCode2]
    );

watch(
  () => totalPerPublicationGroupSmallCounts.value,
  (newValue) => {
    if (newValue) {
      fetchPublicationNames(
        Object.keys(totalPerPublicationGroupSmallCounts.value).filter(
          (publicationCode) => publicationCode !== "null"
        )
      );
      hasPublicationNames.value = true;
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
  },
  { immediate: true }
);
</script>

<style scoped>

</style>
