<template>
  <LinkToCollectionIfNoIssue />
  <div class="wrapper">
    <pie v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import {
  ArcElement,
  Chart,
  ChartData,
  ChartOptions,
  DefaultDataPoint,
  Legend,
  PieController,
  Title,
  Tooltip,
} from "chart.js";
import { Pie } from "vue-chartjs";
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

const { loadCollection } = collection();
const { totalPerPublication, issues } = storeToRefs(collection());

const { fetchPublicationNames } = coa();
const { publicationNames } = storeToRefs(coa());

loadCollection();
const { t: $t } = useI18n();

const smallCountPublications = $computed(() =>
  !totalPerPublication.value
    ? null
    : Object.keys(totalPerPublication.value).filter(
        (publicationcode) =>
          totalPerPublication.value![publicationcode] / issues.value!.length <
          0.01,
      ),
);
const totalPerPublicationGroupSmallCounts: {
  [publicationcode: string]: number;
} = $computed(
  () =>
    (smallCountPublications &&
      totalPerPublication.value && {
        ...Object.keys(totalPerPublication.value)
          .filter(
            (publicationcode) =>
              !smallCountPublications.includes(publicationcode),
          )
          .reduce(
            (acc, publicationcode) => ({
              ...acc,
              [publicationcode]: totalPerPublication.value![publicationcode],
            }),
            {},
          ),
        ...(!smallCountPublications.length
          ? {}
          : {
              [""]: smallCountPublications.reduce(
                (acc, publicationcode) =>
                  acc + totalPerPublication.value![publicationcode],
                0,
              ),
            }),
      }) ||
    {},
);
const labels = $computed(
  () =>
    hasPublicationNames &&
    Object.entries(totalPerPublicationGroupSmallCounts)
      .sort(sortByCount)
      .reduce(
        (acc, [publicationcode]) => [
          ...acc,
          publicationNames.value[publicationcode] ||
            `${$t("Autres")} (${smallCountPublications!.length} ${$t(
              "Publications",
            ).toLowerCase()})`,
        ],
        [] as string[],
      ),
);
const values = $computed(() =>
  Object.values(totalPerPublicationGroupSmallCounts).sort((count1, count2) =>
    Math.sign(count1 - count2),
  ),
);
const colors = $computed(
  () =>
    totalPerPublicationGroupSmallCounts &&
    Object.entries(totalPerPublicationGroupSmallCounts)
      .sort(sortByCount)
      .map(([publicationcode]) =>
        publicationcode === "" ? "#000" : randomColor(),
      ),
);
const randomColor = () =>
  `rgb(${[
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ].join(",")})`;
const sortByCount = (
  [publicationCode1]: [publicationCode1: string, _idx: number],
  [publicationCode2]: [publicationCode2: string, _idx2: number],
) =>
  Math.sign(
    totalPerPublicationGroupSmallCounts[publicationCode1] -
      totalPerPublicationGroupSmallCounts[publicationCode2],
  );

let hasPublicationNames = $ref<boolean>(false);
let chartData = $ref<ChartData<"pie", DefaultDataPoint<"pie">, string> | null>(
  null,
);
let options = $ref<ChartOptions<"pie">>({});

watch(
  $$(totalPerPublicationGroupSmallCounts),
  async (newValue) => {
    if (Object.keys(newValue).length) {
      await fetchPublicationNames(
        Object.keys(totalPerPublicationGroupSmallCounts).filter(
          (publicationcode) => publicationcode !== "",
        ),
      );
      hasPublicationNames = true;
    }
  },
  { immediate: true },
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
              const total = data.reduce((acc, value) => acc + value, 0);
              const percentage = total
                ? parseFloat(((currentValue / total) * 100).toFixed(1))
                : 0;
              return `${currentValue} (${percentage}%)`;
            },

            title: (tooltipItems) =>
              chartData!.labels![tooltipItems[0].dataIndex],
          },
        },
      },
    };
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.wrapper {
  > div {
    max-width: 100%;
    max-height: 100%;
  }

  :deep(canvas) {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}
</style>
