<template>
  <BarChart
    v-if="chartData"
    :chart-data="chartData"
    :options="options"
  />
</template>

<script>
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapState} from "pinia";
import l10nMixin from "../../mixins/l10nMixin";
import { collection } from "../../stores/collection";
import { coa } from "../../stores/coa";
import {BarChart} from "vue-chart-3";

import {ArcElement, Chart, CategoryScale, LinearScale, Legend, BarElement, BarController, Title, Tooltip} from 'chart.js';
Chart.register(Legend, CategoryScale, BarElement, LinearScale, BarController, Tooltip, Title, ArcElement);

export default {
  name: "PossessionStats",
  components: {BarChart},
  mixins: [collectionMixin, l10nMixin],

  props: {
    unit: {
      type: String,
      required: true
    }
  },
  emits: ['change-dimension'],

  data: () => ({
    chartData: null,
    options: {}
  }),

  computed: {
    ...mapState(collection, ["collection", "totalPerPublication"]),
    ...mapState(coa, ["countryNames", "issueCounts", "publicationNames"]),

    labels() {
      return Object.keys(this.totalPerPublication)
    },

    values() {
      if (!(this.totalPerPublication && this.issueCounts && this.countryNames)) {
        return null
      }
      const vm = this
      let possessedIssues = Object.values(this.totalPerPublication);
      let missingIssues = Object.keys(this.totalPerPublication)
        .map(publicationCode => vm.issueCounts[publicationCode] - this.totalPerPublication[publicationCode]);
      if (this.unit === 'percentage') {
        possessedIssues = possessedIssues.map((possessedCount, key) =>
          Math.round(possessedCount * (100 / (possessedCount + missingIssues[key]))))
        missingIssues = possessedIssues.map(possessedCount => 100 - possessedCount)
      }
      return [
        possessedIssues,
        missingIssues
      ]
    },
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          await this.fetchCountryNames()
          await this.fetchPublicationNames(Object.keys(newValue))
          await this.fetchIssueCounts()
        }
      }
    },
    labels: {
      immediate: true,
      async handler(newValue) {
        this.$emit('change-dimension', 'height', 100 + 30 * newValue.length)
        this.$emit('change-dimension', 'width', 500)
      }
    },
    values: function (newValue) {
      if (newValue) {
        const vm = this
        this.chartData = {
          datasets: [
            {
              data: this.values[0],
              backgroundColor: 'green',
              label: this.$t("Numéros possédés"),
              legend: this.$t("Numéros possédés")
            },
            {
              data: this.values[1],
              backgroundColor: 'orange',
              label: this.$t("Numéros référencés non-possédés"),
              legend: this.$t("Numéros référencés non-possédés")
            }
          ],
          labels: this.labels,
          legends: [this.$t("Numéros possédés"), this.$t("Numéros référencés non-possédés")]
        }

        this.options = {
          responsive: true,
          indexAxis: 'y',
          maintainAspectRatio: false,
          scales: {
            x: {
              min: 0,
              max: vm.unit === 'percentage' ? 100 : undefined,
              stacked: true,
              ticks: {
                stepSize: 1,
                callback: value => vm.unit === 'percentage' ? `${value}%` : value
              }
            },
            y: {
              stacked: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: this.$t("Possession des numéros")
            },
            tooltip: {
              enabled: true,
              position: 'nearest',
              mode: 'index',
              axis: 'y',
              intersect: false,
              callbacks: {
                title: ([tooltipItem]) => {
                  const publicationcode = tooltipItem.label
                  if (!vm.publicationNames[publicationcode]) {
                    vm.publicationNames[publicationcode] = '?';
                  }
                  return `${vm.publicationNames[publicationcode] || '?'} (${vm.countryNames[publicationcode.split('/')[0]]})`;
                },
                label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}${vm.unit === 'percentage' ? '%' : ''}`,
              }
            }
          }
        }
      }
    }
  },

  methods: {
    ...mapActions(coa, ["fetchCountryNames", "fetchPublicationNames", "fetchIssueCounts"])
  }
}
</script>

<style scoped>
</style>
