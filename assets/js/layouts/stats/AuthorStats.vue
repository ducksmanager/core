<template>
  <BarChart
    v-if="chartData"
    :chart-data="chartData"
    :options="options"
  />
</template>

<script>
import collectionMixin from "../../mixins/collectionMixin";
import l10nMixin from "../../mixins/l10nMixin";
import {BarChart} from "vue-chart-3";

import {Chart, CategoryScale, LinearScale, Legend, BarElement, BarController, Title, Tooltip} from 'chart.js';
Chart.register(Legend, CategoryScale, BarElement, LinearScale, BarController, Tooltip, Title);

export default {
  name: "AuthorStats",
  components: {BarChart},
  mixins: [collectionMixin, l10nMixin],

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

  data() {
    return {
      chartData: null,
      options: {}
    }
  },

  computed: {
    labels() {
      return Object.values(this.watchedAuthorsStoryCount).map(({fullname: fullName}) => fullName)
    },

    values() {
      let possessedStories = Object.values(this.watchedAuthorsStoryCount)
        .map(({storycount: storyCount, missingstorycount: missingStoryCount}) =>
          storyCount - missingStoryCount
        )

      let missingStories = Object.values(this.watchedAuthorsStoryCount)
        .map(({missingstorycount: missingStoryCount}) =>
          missingStoryCount
        )

      if (this.unit === 'percentage') {
        possessedStories = possessedStories.map((possessedCount, key) =>
          Math.round(possessedCount * (100 / (possessedCount + missingStories[key]))))
        missingStories = possessedStories.map(possessedCount => 100 - possessedCount)
      }

      return [
        possessedStories,
        missingStories
      ]
    },
  },

  mounted() {
    this.$emit('change-dimension', 'width', 250 + 50 * this.labels.length);
    const vm = this
    this.chartData = {
      datasets: [
        {
          data: this.values[0],
          backgroundColor: '#FF8000',
          label: this.$t("Histoires possédées"),
          legend: this.$t("Histoires possédées")
        },
        {
          data: this.values[1],
          backgroundColor: '#04B404',
          label: this.$t("Histoires non possédées"),
          legend: this.$t("Histoires non possédées")
        }
      ],
      labels: this.labels,
      legends: [this.$t("Histoires possédées"), this.$t("Histoires non possédées")]
    }

    this.options = {
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
          text: this.$t("Possession des histoires d'auteurs")
        },
        tooltip: {
          enabled: true,
          callbacks: {
            title: ([tooltip]) => tooltip.label,
            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}${vm.unit === 'percentage' ? '%' : ''}`,
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
