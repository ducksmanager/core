<template>
  <BarChart v-if="chartData" :chart-data="chartData" :options="options" />
</template>
<script setup>
import {
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
import { BarChart } from "vue-chart-3";
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";

Chart.register(
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
  BarController,
  Tooltip,
  Title
);

collection().loadCollection();
const { unit } = defineProps({
    unit: {
      type: String,
      required: true,
    },
  }),
  { t: $t } = useI18n(),
  emit = defineEmits(["change-dimension"]),
  purchases = $computed(() => collection().purchases),
  totalPerPublication = $computed(() => collection().totalPerPublication),
  publicationNames = $computed(() => coa().publicationNames),
  labels = $computed(
    () =>
      collectionWithDates &&
      [...new Set(collectionWithDates.map(({ date }) => date))].sort(
        compareDates
      )
  ),
  collectionWithDates = $computed(
    () =>
      purchasesById &&
      collection().collection?.map((issue) => ({
        ...issue,
        date: getIssueMonth(issue),
      }))
  ),
  ready = $computed(() => labels && hasPublicationNames),
  fetchPublicationNames = coa().fetchPublicationNames,
  loadPurchases = collection().loadPurchases,
  compareDates = (a, b) =>
    Math.sign(
      new Date(a === "?" ? "0001-01-01" : a) -
        new Date(b === "?" ? "0001-01-01" : b)
    ),
  randomColor = () =>
    `rgb(${[
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ].join(",")})`,
  getIssueMonth = (issue) =>
    getMonthFromDate(
      issue.purchaseId
        ? (purchasesById[issue.purchaseId] || { date: "?" }).date
        : issue.creationDate && new Date(issue.creationDate)
        ? getMonthFromDate(issue.creationDate)
        : "?"
    ),
  getMonthFromDate = (date) => date.match(/^\?|([^-]+-[^-]+)/)[0];

let hasPublicationNames = $ref(false),
  purchasesById = $ref(null),
  chartData = $ref(null),
  options = $ref({});

watch(
  () => totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(Object.keys(newValue));
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

watch(
  () => purchases,
  (newValue) => {
    if (newValue) {
      purchasesById = purchases.reduce(
        (acc, purchase) => ({
          ...acc,
          [purchase.id]: purchase,
        }),
        {}
      );
    }
  },
  { immediate: true }
);

watch(
  () => ready,
  (newValue) => {
    if (newValue) {
      const dateAssoc = labels.reduce(
        (dates, date) => ({
          ...dates,
          [date]: 0,
        }),
        {}
      );

      let accDate = labels.reduce((acc, value) => ({ ...acc, [value]: 0 }), {});
      const values = collectionWithDates
        .sort(({ date: dateA }, { date: dateB }) => compareDates(dateA, dateB))
        .reduce((acc, { date, publicationCode }) => {
          if (!acc[publicationCode]) {
            acc[publicationCode] = { ...dateAssoc };
          }
          acc[publicationCode][date]++;
          accDate[date]++;
          return acc;
        }, {});

      const maxPerDate = Object.keys(accDate).reduce(
        (acc, date) => Math.max(acc, accDate[date]),
        0
      );

      emit(
        "change-dimension",
        "height",
        Math.max(document.body.offsetHeight, maxPerDate / 4)
      );

      emit("change-dimension", "width", 250 + 30 * labels.length);

      const datasets = Object.keys(values).map((publicationCode) => {
        let data = values[publicationCode];
        if (unit === "total") {
          data = labels.reduce(
            (acc, currentDate) => ({
              ...acc,
              [currentDate]: labels
                .filter((_, idx) => idx <= labels.indexOf(currentDate))
                .reduce((sum, date) => sum + data[date], 0),
            }),
            {}
          );
        }
        return {
          data: Object.values(data),
          label: publicationNames[publicationCode],
          backgroundColor: randomColor(),
        };
      });

      chartData = {
        datasets,
        labels,
      };

      options = {
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false,
            },
          },
          y: {
            stacked: true,
          },
        },
        legend: {
          display: false,
        },
        plugins: {
          title: {
            display: true,
            text: $t("Achats"),
          },
          tooltip: {
            enabled: true,
            callbacks: {
              beforeTitle: ([tooltipItem]) =>
                (tooltipItem.label !== "?"
                  ? `${
                      unit === "total"
                        ? $t("Taille de la collection pour le mois")
                        : $t("Nouvelles acquisitions pour le mois")
                    } ${tooltipItem.label}`
                  : $t("Numéros sans dates d'achat")) + "\n",
              title: ([tooltipItem]) =>
                chartData.datasets[tooltipItem.datasetIndex].label,
              label: (tooltipItem) => tooltipItem.raw,
              footer: ([tooltipItem]) =>
                [
                  $t("Tous magazines"),
                  datasets.reduce(
                    (acc, dataset) => acc + dataset.data[tooltipItem.dataIndex],
                    0
                  ),
                ].join("\n"),
            },
          },
        },
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await loadPurchases();
});
</script>

<style scoped>

</style>
