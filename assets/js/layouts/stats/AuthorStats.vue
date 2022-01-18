<template>
  <BarChart
    :chart-data="chartData"
    :options="options"
  />
</template>

<script>
import collectionMixin from "../../mixins/collectionMixin";
import {BarChart} from "vue-chart-3";

import {Chart, CategoryScale, LinearScale, Legend, BarElement, BarController, Title, Tooltip} from 'chart.js';
import {useI18n} from "vue-i18n";
Chart.register(Legend, CategoryScale, BarElement, LinearScale, BarController, Tooltip, Title);

export default {
  name: "AuthorStats",
  components: {BarChart},
  mixins: [collectionMixin],

  props: {
    unit: {
      type: String,
      required: true
    },
    watchedAuthorsStoryCount: {
      type: Object,
      required: true
    }
  },
  emits: ['change-dimension'],

  setup(props, { emit }) {
    const { t: $t } = useI18n()

    const labels = Object.values(props.watchedAuthorsStoryCount).map(({fullname: fullName}) => fullName);
    emit('change-dimension', 'width', 250 + 50 * labels.length);

    let possessedStories,
        missingStories;

    if (props.unit === 'percentage') {
      possessedStories = possessedStories.map((possessedCount, key) =>
        Math.round(possessedCount * (100 / (possessedCount + missingStories[key]))))
      missingStories = possessedStories.map(possessedCount => 100 - possessedCount)
    }
    else {
      possessedStories = Object.values(props.watchedAuthorsStoryCount)
        .map(({storycount: storyCount, missingstorycount: missingStoryCount}) =>
          storyCount - missingStoryCount
        );
      missingStories = Object.values(props.watchedAuthorsStoryCount)
        .map(({missingstorycount: missingStoryCount}) =>
          missingStoryCount
        );
    }

    const values = [
      possessedStories,
      missingStories
    ]

    return {
      values,
      chartData: {
        datasets: [
          {
            data: values[0],
            backgroundColor: '#FF8000',
            label: $t("Histoires possédées"),
            legend: $t("Histoires possédées")
          },
          {
            data: values[1],
            backgroundColor: '#04B404',
            label: $t("Histoires non possédées"),
            legend: $t("Histoires non possédées")
          }
        ],
        labels,
        legends: [$t("Histoires possédées"), $t("Histoires non possédées")]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false
            }
          },
          y: {
            stacked: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: $t("Possession des histoires d'auteurs")
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: ([tooltip]) => tooltip.label,
              label: ({dataset, raw}) => `${dataset.label}: ${raw}${props.unit === 'percentage' ? '%' : ''}`,
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
