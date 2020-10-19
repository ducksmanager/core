<script>
import {Bar} from 'vue-chartjs'
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapGetters, mapState} from "vuex";
import l10nMixin from "../../mixins/l10nMixin";

export default {
  name: "PurchaseStats",
  extends: Bar,
  mixins: [collectionMixin, l10nMixin],

  props: {
    unit: {
      type: String,
      required: true
    }
  },
  emits: ['change-dimension'],

  data: () => ({
    purchasesById: null
  }),

  computed: {
    ...mapState("collection", ["collection", "purchases"]),
    ...mapGetters("collection", ["totalPerPublication"]),

    labels() {
      return this.collectionWithDates && [...new Set(
          this.collectionWithDates.map(({date}) => date)
      )].sort((a, b) => a < b || a === null ? -1 : 1)
    },
    collectionWithDates() {
      const vm = this
      return this.collection && this.purchasesById && this.collection.map(issue => ({
        ...issue,
        date: vm.getIssueDate(issue)
      }))
    },
    ready() {
      return this.labels && this.publicationNames
    }
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          await this.fetchPublicationNames(Object.keys(newValue))
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
              .sort(({date: dateA}, {date: dateB}) => dateA < dateB || dateA === null ? -1 : 1)
              .reduce((acc, {date, publicationCode}) => {
                if (!acc[publicationCode]) {
                  acc[publicationCode] = {...dateAssoc}
                }
                acc[publicationCode][date]++
                accDate[date]++
                return acc
              }, {})

          const maxPerDate = Object.keys(accDate).reduce((acc, date) => Math.max(acc, accDate[date]), 0)

          this.$emit('change-dimension', 'height', Math.min(
              document.body.offsetHeight,
              Math.max(300, maxPerDate / 4)
          ));

          this.$emit('change-dimension', 'width', 250 + 30 * vm.labels.length)

          const datasets = Object.keys(values).map(publicationCode => {
            let data = values[publicationCode];
            if (vm.unit === 'total') {
              data = Object.keys(data).reduce((acc, currentDate) => ({
                ...acc,
                [currentDate]: Object.keys(data)
                    .filter(date => date <= currentDate)
                    .reduce((sum, date) => sum + data[date], 0)
              }), {})
            }
            return {
              data: Object.values(data),
              label: vm.publicationNames[publicationCode],
              backgroundColor: vm.randomColor(),
            }
          });

          this.renderChart({
            datasets,
            labels: this.labels,
          }, {
            animation: {
              duration: 0
            },
            hover: {
              animationDuration: 0
            },
            responsiveAnimationDuration: 0,
            title: {
              display: true,
              text: this.l10n.ACHATS
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              xAxes: [{
                stacked: true,
                ticks: {
                  autoSkip: false
                }
              }],
              yAxes: [{
                stacked: true
              }]
            },
            legend: {
              display: false
            },
            tooltips: {
              enabled: true,
              mode: 'single',
              callbacks: {
                beforeTitle: ([tooltipItem]) => {
                  return (tooltipItem.label !== '?'
                    ? `${vm.unit === 'total'
                      ? vm.l10n.ACHATS_NUMEROS_TAILLE
                      : vm.l10n.ACHATS_NUMEROS_NOUVELLES_ACQUISITIONS} ${tooltipItem.label}`
                    : vm.l10n.ACHATS_NUMEROS_SANS_DATE
                  ) + "\n";
                },
                title: (tooltipItem, {datasets}) => datasets[tooltipItem[0].datasetIndex].label,
                label: tooltipItem => tooltipItem.yLabel,
                footer: tooltipItem => [
                  vm.l10n.TOUS_MAGAZINES,
                  vm.unit === 'total'
                  // ? get_total_until_now(tooltipItem[0].xLabel, totauxDates)
                  // : totauxDates[tooltipItem[0].xLabel]
                ].join('\n')
              }
            }
          })
        }
      }
    }
  },

  async mounted() {
    await this.loadPurchases()
  },

  methods: {
    ...mapActions("coa", ["fetchPublicationNames"]),
    ...mapActions("collection", ["loadPurchases"]),

    randomColor: () => `rgb(${[Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)].join(',')})`,

    getIssueDate(issue) {
      return issue.purchaseId
          ? (this.purchasesById[issue.purchaseId] || {date: '?'}).date
          : (issue.creationDate && new Date(issue.creationDate) ? issue.creationDate : null)
    }
  }
}
</script>

<style scoped>

</style>