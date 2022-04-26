<template>
  <BarChart
    v-if="chartData"
    :chart-data="chartData"
    :options="options"
  />
</template>
<script>
import {mapActions, mapState} from "pinia";
import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
import {BarChart} from "vue-chart-3";

import {Chart, CategoryScale, LinearScale, Legend, BarElement, BarController, Title, Tooltip} from 'chart.js';
Chart.register(Legend, CategoryScale, BarElement, LinearScale, BarController, Tooltip, Title);

export default {
  name: "PurchaseStats",
  components: {BarChart},

  props: {
    unit: {
      type: String,
      required: true
    }
  },
  emits: ['change-dimension'],

  setup() {
    this.loadCollection()
  },

  data: () => ({
    hasPublicationNames: false,
    purchasesById: null,
    chartData: null,
    options: {}
  }),

  computed: {
    ...mapState(collection, ["collection", "purchases", "totalPerPublication"]),
    ...mapState(coa, ["publicationNames"]),

    labels() {
      return this.collectionWithDates && [...new Set(
        this.collectionWithDates.map(({date}) => date)
      )].sort(this.compareDates)
    },
    collectionWithDates() {
      const vm = this
      return this.collection && this.purchasesById && this.collection.map(issue => ({
        ...issue,
        date: vm.getIssueMonth(issue)
      }))
    },
    ready() {
      return this.labels && this.hasPublicationNames
    }
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          await this.fetchPublicationNames(Object.keys(newValue))
          this.hasPublicationNames = true
        }
      }
    },
    purchases: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.purchasesById = this.purchases.reduce((acc, purchase) => ({
            ...acc,
            [purchase.id]: purchase
          }), {})
        }
      }
    },
    ready: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const vm = this
          const dateAssoc = vm.labels
            .reduce((dates, date) => ({
              ...dates,
              [date]: 0
            }), {})

          let accDate = vm.labels.reduce((acc, value) => ({...acc, [value]: 0}), {})
          const values = this.collectionWithDates
            .sort(({date: dateA}, {date: dateB}) => vm.compareDates(dateA, dateB))
            .reduce((acc, {date, publicationCode}) => {
              if (!acc[publicationCode]) {
                acc[publicationCode] = {...dateAssoc}
              }
              acc[publicationCode][date]++
              accDate[date]++
              return acc
            }, {})

          const maxPerDate = Object.keys(accDate).reduce((acc, date) => Math.max(acc, accDate[date]), 0)

          this.$emit('change-dimension', 'height', Math.max(
            document.body.offsetHeight,
            maxPerDate / 4
          ));

          this.$emit('change-dimension', 'width', 250 + 30 * vm.labels.length)

          const datasets = Object.keys(values).map(publicationCode => {
            let data = values[publicationCode];
            if (vm.unit === 'total') {
              data = vm.labels.reduce((acc, currentDate) => ({
                ...acc,
                [currentDate]: vm.labels
                  .filter((_, idx) => idx <= vm.labels.indexOf(currentDate))
                  .reduce((sum, date) => sum + data[date], 0)
              }), {})
            }
            return {
              data: Object.values(data),
              label: vm.publicationNames[publicationCode],
              backgroundColor: vm.randomColor(),
            }
          });

          this.chartData = {
            datasets,
            labels: this.labels,
          }

          this.options = {
            animation: {
              duration: 0
            },
            hover: {
              animationDuration: 0
            },
            responsiveAnimationDuration: 0,
            responsive: true,
            maintainAspectRatio: true,
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
            legend: {
              display: false
            },
            plugins: {
              title: {
                display: true,
                text: this.$t('Achats')
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  beforeTitle: ([tooltipItem]) =>
                    (tooltipItem.label !== '?'
                        ? `${vm.unit === 'total'
                          ? vm.$t('Taille de la collection pour le mois')
                          : vm.$t('Nouvelles acquisitions pour le mois')} ${tooltipItem.label}`
                        : vm.$t("Numéros sans dates d'achat")
                    ) + "\n",
                  title: ([tooltipItem]) => vm.chartData.datasets[tooltipItem.datasetIndex].label,
                  label: (tooltipItem) => tooltipItem.raw,
                  footer: ([tooltipItem]) =>
                    [
                      vm.$t('Tous magazines'),
                      datasets.reduce((acc, dataset) => acc + dataset.data[tooltipItem.dataIndex], 0)
                    ].join('\n')
                }
              }
            }
          }
        }
      }
    }
  },

  async mounted() {
    await this.loadPurchases()
  },

  methods: {
    ...mapActions(coa, ["fetchPublicationNames"]),
    ...mapActions(collection, ["loadCollection", "loadPurchases"]),

    compareDates: (a, b) => Math.sign(
      new Date(a === '?' ? '0001-01-01' : a)
      - new Date(b === '?' ? '0001-01-01' : b)
    ),

    randomColor: () => `rgb(${[Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)].join(',')})`,

    getIssueMonth(issue) {
      return this.getMonthFromDate(
        issue.purchaseId
          ? (this.purchasesById[issue.purchaseId] || {date: '?'}).date
          : (issue.creationDate && new Date(issue.creationDate) ? this.getMonthFromDate(issue.creationDate) : '?')
      )
    },

    getMonthFromDate: date => date.match(/^\?|([^-]+-[^-]+)/)[0]
  }
}
</script>

<style scoped>

</style>
