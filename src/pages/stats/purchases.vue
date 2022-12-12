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
    <i18n-t
      tag="div"
      keypath="Afin de retracer l'évolution de votre collection, renseignez les dates d'achat de vos numéros dans la page {link_to_collection}, puis revenez ici ! Si une date d'achat n'a pas été indiquée pour un numéro, sa date d'ajout dans la collection est utilisée"
      ><template #link_to_collection
        ><router-link to="/collection/show">{{
          $t("Gérer ma collection")
        }}</router-link></template
      ></i18n-t
    >
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
    <bar
      v-if="chartData"
      :chart-data="chartData"
      :chart-options="options"
      :style="{ width, height }"
    />
  </div>
</template>
<script setup lang="ts">
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import dayjs from "dayjs";
import { onMounted, watch } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { issue, purchase } from "~prisma_clients/client_dm";

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
  changeDimension = (dimension: string, value: number) => {
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
      (purchasesById &&
        collection().collection?.map((issue) => ({
          ...issue,
          date: getIssueMonth(issue),
        }))) ||
      null
  ),
  labels = $computed(
    () =>
      collectionWithDates &&
      [...new Set(collectionWithDates.map(({ date }) => date))]
        .filter((date) => date)
        .sort(compareDates)
  ),
  ready = $computed(() => labels && hasPublicationNames),
  fetchPublicationNames = coa().fetchPublicationNames,
  loadPurchases = collection().loadPurchases,
  compareDates = (a: string, b: string) =>
    dayjs(a === "?" ? "0001-01-01" : a).diff(
      dayjs(b === "?" ? "0001-01-01" : b)
    ),
  randomColor = () =>
    `rgb(${[
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ].join(",")})`,
  getIssueMonth = (issue: issue): string =>
    getMonthFromDate(
      issue.purchaseId
        ? dayjs(
            (purchasesById![issue.purchaseId] || { date: "?" }).date
          ).toString()
        : issue.creationDate?.toString() || "?"
    ),
  getMonthFromDate = (date: string) =>
    date.match(/^\?|([^-]+-[^-]+)/)?.[0] || "?";

let hasPublicationNames = $ref(false as boolean),
  purchasesById = $ref(null as { [purchaseId: number]: purchase } | null),
  chartData = $ref(null as ChartData | null),
  options = $ref({} as ChartOptions),
  width = $ref(null as string | null),
  height = $ref(null as string | null),
  purchaseTypeCurrent = $ref("new" as string);

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
      purchasesById = newValue.reduce(
        (acc, purchase) => ({
          ...acc,
          [purchase.id]: purchase,
        }),
        {} as { [purchaseId: number]: purchase }
      );
    }
  },
  { immediate: true }
);

watch(
  () => ready && purchaseTypeCurrent && collectionWithDates,
  (newValue) => {
    if (newValue) {
      const dateAssoc = labels!.reduce(
        (dates, date) => ({
          ...dates,
          [date]: 0,
        }),
        {}
      );

      let accDate: { [label: string]: number } = labels!.reduce(
        (acc, value) => ({ ...acc, [value]: 0 }),
        {}
      );
      const values = collectionWithDates!
        .sort(({ date: dateA }, { date: dateB }) => compareDates(dateA, dateB))
        .reduce((acc, { date, publicationCode: publicationcode }) => {
          if (!publicationCodesWithOther.includes(publicationcode)) {
            publicationcode = "Other";
          }
          if (!acc[publicationcode]) {
            acc[publicationcode] = { ...dateAssoc };
          }
          acc[publicationcode][date]++;
          accDate[date]++;
          return acc;
        }, {} as { [publicationcode: string]: { [date: string]: number } });

      const maxPerDate = Object.keys(accDate).reduce(
        (acc, date) => Math.max(acc, accDate[date]),
        0
      );

      changeDimension(
        "height",
        Math.max(document.body.offsetHeight, maxPerDate / 4)
      );

      changeDimension("width", 250 + 30 * labels!.length);

      const datasets = Object.keys(values).map((publicationCode) => {
        let data = values[publicationCode];
        if (purchaseTypeCurrent === "total") {
          data = labels!.reduce(
            (acc, currentDate) => ({
              ...acc,
              [currentDate]: labels!
                .filter((_, idx) => idx <= labels!.indexOf(currentDate))
                .reduce((sum, date) => sum + data[date], 0),
            }),
            {}
          );
        }
        console.log(publicationNames[publicationCode])
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
        labels: labels!,
      };

      options = {
        animation: {
          duration: 0,
        },
        hover: {
          // animationDuration: 0,
        },
        // responsiveAnimationDuration: 0,
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
        // legend: {
        //   display: false,
        // },
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
                chartData!.datasets[tooltipItem.datasetIndex].label,
              label: (tooltipItem) => tooltipItem.raw as string,
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

  > div {
    width: 100% !important;
    height: 100% !important;
  }
}

:deep(.btn) {
  &:focus {
    box-shadow: none !important;
  }
}
</style>
