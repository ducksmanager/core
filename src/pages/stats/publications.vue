<template>
  <LinkToCollectionIfNoIssue />
  <pie v-if="chartData" :chart-data="chartData" :chart-options="options" />
</template>

<script setup lang="ts">
import {
  ArcElement,
  Chart,
  ChartData,
  ChartOptions,
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
        (publicationcode) =>
          totalPerPublication[publicationcode] /
            collection().collection!.length <
          0.01
      )
);
const totalPerPublicationGroupSmallCounts: {
  [publicationcode: string]: number;
} = $computed(
  () =>
    (smallCountPublications &&
      totalPerPublication && {
        ...Object.keys(totalPerPublication)
          .filter(
            (publicationcode) =>
              !smallCountPublications.includes(publicationcode)
          )
          .reduce(
            (acc, publicationcode) => ({
              ...acc,
              [publicationcode]: totalPerPublication[publicationcode],
            }),
            {}
          ),
        ...(!smallCountPublications.length
          ? {}
          : {
              [""]: smallCountPublications.reduce(
                (acc, publicationcode) =>
                  acc + totalPerPublication[publicationcode],
                0
              ),
            }),
      }) ||
    {}
);
const labels = $computed(
  () =>
    hasPublicationNames &&
    Object.entries(totalPerPublicationGroupSmallCounts)
      .sort(sortByCount)
      .reduce(
        (acc, [publicationcode]) => [
          ...acc,
          publicationNames[publicationcode] ||
            `${$t("Autres")} (${smallCountPublications!.length} ${$t(
              "Publications"
            ).toLowerCase()})`,
        ],
        [] as string[]
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
      .map(([publicationcode]) =>
        publicationcode === "" ? "#000" : randomColor()
      )
);
const fetchPublicationNames = coa().fetchPublicationNames;
const randomColor = () =>
  `rgb(${[
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ].join(",")})`;
const sortByCount = (
  [publicationCode1]: [publicationCode1: string, _idx: number],
  [publicationCode2]: [publicationCode2: string, _idx2: number]
) =>
  Math.sign(
    totalPerPublicationGroupSmallCounts[publicationCode1] -
      totalPerPublicationGroupSmallCounts[publicationCode2]
  );

let hasPublicationNames = $ref(false as boolean);
let chartData = $ref(null as ChartData<"pie"> | null);
let options = $ref({} as ChartOptions<"pie">);

watch(
  () => totalPerPublicationGroupSmallCounts,
  async (newValue) => {
    if (Object.keys(newValue).length) {
      await fetchPublicationNames(
        Object.keys(totalPerPublicationGroupSmallCounts).filter(
          (publicationcode) => publicationcode !== ""
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
        legend: {
          display: true,
          labels: {
            color: "white",
          },
        },
        tooltip: {
          callbacks: {
            label: ({ dataset: { data }, parsed: currentValue }) => {
              const total = data
                .map((value) => value as number)
                .reduce((acc, value) => acc + value, 0);
              const percentage = total
                ? parseFloat(((currentValue / total) * 100).toFixed(1))
                : 0;
              return `${currentValue} (${percentage}%)`;
            },

            title: (tooltipItems) =>
              chartData!.labels![tooltipItems[0].dataIndex] as string,
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
