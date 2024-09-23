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
import type { issue as dm_issue } from '~prisma-schemas/schemas/dm';
import { coa as webCoa } from '~web/src/stores/coa';

import { wtdcollection } from '~/stores/wtdcollection';

const props = defineProps<{
  since: 'pastYear' | 'allTime';
  style: Record<string, string>;
}>();

Chart.register(Legend, CategoryScale, BarElement, LinearScale, BarController, Tooltip, Title);

const options = ref();

const { issues, totalPerPublication, purchasesById } = storeToRefs(wtdcollection()),
  { t } = useI18n();

const compareDates = (a: string, b: string) =>
    dayjs(a === '?' ? '0001-01-01' : a).diff(dayjs(b === '?' ? '0001-01-01' : b)),
  randomColor = () =>
    `rgb(${Array.from({ length: 3 })
      .map(() => Math.floor(Math.random() * 255))
      .join(',')})`,
  getIssueMonth = (issue: dm_issue): string =>
    getIssueDate(issue).isValid() ? getIssueDate(issue).format('YYYY-MM') : '?',
  getIssueDate = (issue: dm_issue) =>
    dayjs((issue.purchaseId && purchasesById.value![issue.purchaseId]?.date) || issue.creationDate),
  publicationNames = computed(() => webCoa().publicationNames),
  publicationCodesWithOther = computed(
    () =>
      totalPerPublication.value &&
      Object.entries(totalPerPublication.value || {})
        .sort(([, count1], [, count2]) => Math.sign(count2 - count1))
        .filter((_entry, idx) => idx < 5)
        .map(([publicationcode]) => publicationcode)
        .concat(['Other']),
  ),
  collectionWithDates = computed(
    () =>
      (purchasesById.value &&
        issues.value?.map((issue) => ({
          ...issue,
          date: getIssueMonth(issue),
        }))) ||
      null,
  ),
  labels = computed(() => {
    const months =
      collectionWithDates.value &&
      [...new Set(collectionWithDates.value.map(({ date }) => date))].filter((date) => date).sort(compareDates);
    if (!months) {
      return months;
    }

    return months;

    // const dayToMonth = (day: dayjs.Dayjs) => day.set('day', 1).format('YYYY-MM');

    // const lastMonthOnGraph = dayToMonth(dayjs());
    // let currentMonthIdx = months.findIndex((month) => month !== '?');
    // let currentMonth = dayjs(months[currentMonthIdx] + '-01');
    // while (currentMonth.format('YYYY-MM') < lastMonthOnGraph) {
    //   let nextDateMonth = dayToMonth(currentMonth.add(1, 'month'));
    //   currentMonthIdx++;
    //   while (months[currentMonthIdx] > nextDateMonth) {
    //     months.splice(currentMonthIdx, 0, nextDateMonth);
    //     currentMonthIdx++;
    //     nextDateMonth = dayToMonth(currentMonth.add(1, 'month'));
    //   }
    // }
    // return months;
  }),
  ready = computed(() => labels.value),
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
    let accDate = Object.fromEntries(labels.value!.map((value) => [value, 0]));

    return collectionWithDates.value
      .sort(({ date: dateA }, { date: dateB }) => compareDates(dateA, dateB))
      .reduce<Record<string, Record<string, number>>>((acc, { date, publicationcode: publicationcode }) => {
        if (!publicationCodesWithOther.value!.includes(publicationcode)) {
          publicationcode = 'Other';
        }
        if (!acc[publicationcode]) {
          acc[publicationcode] = { ...dateAssoc };
        }
        acc[publicationcode][date]++;
        accDate[date]++;
        return acc;
      }, {});
  }),
  datasets = computed(() =>
    !(ready.value && collectionWithDates.value && values.value)
      ? null
      : Object.keys(values.value).map((publicationcode) => {
          let data = values.value![publicationcode];
          data = labels.value!.reduce<Record<string, number>>((acc, currentDate, idx) => {
            acc[currentDate] = (acc[labels.value![idx - 1]] || 0) + data[currentDate];
            return acc;
          }, {});

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
          datasets:
            props.since === 'allTime'
              ? datasets.value
              : datasets.value!.map((value) => ({ ...value, data: value.data.slice(value.data.length - 11) })),
          labels: props.since === 'allTime' ? labels.value : labels.value.slice(labels.value.length - 11),
        },
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
                  t('Toutes publications'),
                  datasets.value!.reduce((acc, dataset) => acc + dataset.data[tooltipItem.dataIndex], 0),
                ].join('\n'),
            },
          },
        },
      } as ChartOptions<'bar'>;
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100% !important;

  > div,
  :deep(canvas) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
