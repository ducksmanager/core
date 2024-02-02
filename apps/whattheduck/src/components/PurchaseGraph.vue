<template>
  <div class="wrapper" :style="style || {}">
    <bar v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>
<script setup lang="ts">
import type { ChartOptions } from 'chart.js';
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import dayjs from 'dayjs';
import { Bar } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';
import type { issue as dm_issue } from '~prisma-clients/client_dm';
import { coa } from '~web/src/stores/coa';

import { wtdcollection } from '~/stores/wtdcollection';

const props = defineProps<{
  since: 'pastYear' | 'allTime';
  style: Record<string, string>;
}>();

Chart.register(Legend, CategoryScale, BarElement, LinearScale, BarController, Tooltip, Title);

const hasPublicationNames = ref(false as boolean),
  options = ref({} as ChartOptions<'bar'>);

const wtdCollectionStore = wtdcollection(),
  { totalPerPublication, purchasesById } = storeToRefs(wtdcollection()),
  { t } = useI18n();

const compareDates = (a: string, b: string) =>
    dayjs(a === '?' ? '0001-01-01' : a).diff(dayjs(b === '?' ? '0001-01-01' : b)),
  randomColor = () =>
    `rgb(${[Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)].join(
      ',',
    )})`,
  getIssueMonth = (issue: dm_issue): string =>
    getIssueDate(issue).isValid() ? getIssueDate(issue).format('YYYY-MM') : '?',
  getIssueDate = (issue: dm_issue) =>
    dayjs((issue.purchaseId && purchasesById.value![issue.purchaseId]?.date) || issue.creationDate),
  publicationNames = computed(() => coa().publicationNames),
  publicationCodesWithOther = computed(
    () =>
      totalPerPublication &&
      Object.entries(totalPerPublication || {})
        .sort(([, count1], [, count2]) => Math.sign(count2 - count1))
        .filter((_entry, idx) => idx < 5)
        .map(([publicationcode]) => publicationcode)
        .concat(['Other']),
  ),
  collectionWithDates = computed(
    () =>
      (purchasesById.value &&
        wtdCollectionStore.issues?.map((issue) => ({
          ...issue,
          date: getIssueMonth(issue),
        }))) ||
      null,
  ),
  labels = computed(
    () =>
      collectionWithDates.value &&
      [...new Set(collectionWithDates.value.map(({ date }) => date))].filter((date) => date).sort(compareDates),
  ),
  ready = computed(() => labels.value && hasPublicationNames.value),
  values = computed(() => {
    if (!collectionWithDates.value) {
      return null;
    }
    const dateAssoc = labels.value!.reduce(
      (dates, date) => ({
        ...dates,
        [date]: 0,
      }),
      {},
    );

    let accDate: { [label: string]: number } = labels.value!.reduce((acc, value) => ({ ...acc, [value]: 0 }), {});
    return collectionWithDates.value
      .sort(({ date: dateA }, { date: dateB }) => compareDates(dateA, dateB))
      .reduce(
        (acc, { date, publicationcode: publicationcode }) => {
          if (!publicationCodesWithOther.value!.includes(publicationcode)) {
            publicationcode = 'Other';
          }
          if (!acc[publicationcode]) {
            acc[publicationcode] = { ...dateAssoc };
          }
          acc[publicationcode][date]++;
          accDate[date]++;
          return acc;
        },
        {} as { [publicationcode: string]: { [date: string]: number } },
      );
  }),
  datasets = computed(() =>
    !(ready.value && collectionWithDates.value && values.value)
      ? null
      : Object.keys(values.value).map((publicationcode) => {
          let data = values.value![publicationcode];
          data = labels.value!.reduce(
            (acc, currentDate) => ({
              ...acc,
              [currentDate]: labels
                .value!.filter((_, idx) => idx <= labels.value!.indexOf(currentDate))
                .reduce((sum, date) => sum + data[date], 0),
            }),
            {},
          );
          return {
            data: Object.values(data),
            label:
              publicationcode === 'Other' ? t('Autres') : publicationNames.value[publicationcode] || publicationcode,
            backgroundColor: publicationcode === 'Other' ? '#aaa' : randomColor(),
          };
        }),
  ),
  chartData = computed(() =>
    !(datasets.value && labels.value)
      ? null
      : {
          datasets: datasets.value!.map((value) =>
            props.since === 'allTime'
              ? value
              : { ...value, data: value.data.filter((_, idx) => idx > value.data.length - 12) },
          ),
          labels: labels.value.filter((_, idx) => (props.since === 'allTime' ? true : idx > labels.value!.length - 12)),
        },
  );

watch(
  () => publicationCodesWithOther.value,
  async (newValue) => {
    if (newValue) {
      await coa().fetchPublicationNames(newValue.filter((value) => value !== 'Other'));
      hasPublicationNames.value = true;
    }
  },
  { immediate: true },
);

watch(
  () => datasets.value && labels.value,
  (newValue) => {
    if (newValue) {
      options.value = {
        animation: {
          duration: 0,
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: 'white',
            },
          },
          y: {
            stacked: true,
            ticks: {
              color: 'white',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'white',
            },
          },
          tooltip: {
            enabled: true,
            callbacks: {
              beforeTitle: ([tooltipItem]) =>
                (tooltipItem.label !== '?'
                  ? `${t('Taille de la collection pour le mois')} ${tooltipItem.label}`
                  : t("Numéros sans dates d'achat")) + '\n',
              title: ([tooltipItem]) => chartData.value!.datasets[tooltipItem.datasetIndex].label,
              label: (tooltipItem) => tooltipItem.raw as string,
              footer: ([tooltipItem]) =>
                [
                  t('Tous magazines'),
                  datasets.value!.reduce((acc, dataset) => acc + dataset.data[tooltipItem.dataIndex], 0),
                ].join('\n'),
            },
          },
        },
      };
    }
  },
  { immediate: true },
);

wtdCollectionStore.loadCollection();
wtdCollectionStore.loadPurchases();
</script>

<style scoped lang="scss">
.wrapper {
  height: 100% !important;

  > div,
  :deep(canvas) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
