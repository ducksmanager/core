<route lang="yaml">
alias: [/achats]
</route>

<template>
  <LinkToCollectionIfNoIssue />
  <BAlert variant="info" show>
    <div>
      {{
        $t(
          "Ce graphique vous permet de retracer l'évolution de votre collection dans le temps."
        )
      }}
    </div>
    <div
      v-html="
        $t(
          'A quel moment votre collection a-t-elle accueilli son 10<sup>ème</sup> numéro ? Son 50<sup>ème</sup> ?'
        )
      "
    />
    <div>
      {{ $t("Quand avez-vous acheté le plus de magazines dans le passé ?") }}
    </div>
    <div
      v-html="
        $t(
          `Afin de retracer l'évolution de votre collection, renseignez les dates d'achat de vos numéros dans la page {0}, puis revenez ici ! Si une date d'achat n'a pas été indiquée pour un numéro, sa date d'ajout dans la collection est utilisée`,
          [
            `<router-link to='/collection/show'>${$t(
              'Gérer ma collection'
            )}</router-link>`,
          ]
        )
      "
    />
  </BAlert>
  <BButtonGroup>
    <BButton
      v-for="(text, purchaseType) in purchaseTypes"
      :key="purchaseType"
      :pressed="purchaseTypeCurrent === purchaseType"
      @click="purchaseTypeCurrent = purchaseType"
    >
      {{ text }}
    </BButton>
  </BButtonGroup>
  <div class="wrapper">
    <bar-chart
      v-if="chartData"
      :chart-data="chartData"
      :options="options"
      :style="{ width, height }"
    />
  </div>
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
const { t: $t } = useI18n(),
  purchaseTypes = {
    new: $t("Afficher les nouvelles acquisitions"),
    total: $t("Afficher les possessions totales"),
  },
  purchases = $computed(() => collection().purchases),
  publicationNames = $computed(() => coa().publicationNames),
  changeDimension = (dimension, value) => {
    if (dimension === "width") width = `${value}px`;
    else height = `${value}px`;
  },
  publicationCodesWithOther = $computed(
    () =>
      collection().totalPerPublication &&
      Object.entries(collection().totalPerPublication)
        .sort(([, count1], [, count2]) => Math.sign(count2 - count1))
        .filter((_entry, idx) => idx < 20)
        .map(([publicationcode]) => publicationcode)
        .concat(["Other"])
  ),
  collectionWithDates = $computed(
    () =>
      purchasesById &&
      collection().collection?.map((issue) => ({
        ...issue,
        date: getIssueMonth(issue),
      }))
  ),
  labels = $computed(
    () =>
      collectionWithDates &&
      [...new Set(collectionWithDates.map(({ date }) => date))].sort(
        compareDates
      )
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
  options = $ref({}),
  width = $ref(null),
  height = $ref(null),
  purchaseTypeCurrent = $ref("new");

watch(
  () => publicationCodesWithOther,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(
        newValue.filter(
          (publicationcodeOrOther) => publicationcodeOrOther !== "Other"
        )
      );
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
  () => ready && purchaseTypeCurrent,
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
          if (!publicationCodesWithOther.includes(publicationCode)) {
            publicationCode = "Other";
          }
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

      changeDimension(
        "height",
        Math.max(document.body.offsetHeight, maxPerDate / 4)
      );

      changeDimension("width", 250 + 30 * labels.length);

      const datasets = Object.keys(values).map((publicationCode) => {
        let data = values[publicationCode];
        if (purchaseTypeCurrent === "total") {
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
          label:
            publicationCode === "Other"
              ? $t("Autres")
              : publicationNames[publicationCode],
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
        maintainAspectRatio: false,
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
                      purchaseTypeCurrent === "total"
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

<style scoped lang="scss">
.wrapper {
  background: #333;
}

:deep(.btn) {
  &:focus {
    box-shadow: none !important;
  }
}
</style>
