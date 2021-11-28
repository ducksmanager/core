<script>
import {HorizontalBar} from 'vue-chartjs'
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapState} from "pinia";
import l10nMixin from "../../mixins/l10nMixin";
import { collection } from "../../stores/collection";
import { coa } from "../../stores/coa";

export default {
  name: "PossessionStats",
  extends: HorizontalBar,
  mixins: [collectionMixin, l10nMixin],

  props: {
    unit: {
      type: String,
      required: true
    }
  },
  emits: ['change-dimension'],

  data: () => ({
    orientation: 'vertical'
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
        this.$emit('change-dimension', this.orientation === 'vertical' ? 'height' : 'width', 100 + 30 * newValue.length)
        this.$emit('change-dimension', this.orientation === 'vertical' ? 'width' : 'height', 500)
      }
    },
    values: function (newValue) {
      if (newValue) {
        const vm = this
        this.renderChart({
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
        }, {
          title: {
            display: true,
            text: this.$t("Possession des numéros")
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              stacked: true,
              ticks: {
                stepSize: 1,
                callback: value => vm.unit === 'percentage' ? `${value}%` : value
              }
            }],
            yAxes: [{
              stacked: true
            }]
          },
          tooltips: {
            enabled: true,
            position: 'nearest',
            mode: 'index',
            axis: this.orientation === 'vertical' ? 'y' : 'x',
            intersect: false,
            callbacks: {
              title: ([tooltipItem]) => {
                const publicationcode = tooltipItem[vm.orientation === 'vertical' ? 'yLabel' : 'xLabel'];
                if (!vm.publicationNames[publicationcode]) {
                  vm.publicationNames[publicationcode] = '?';
                }
                return `${vm.publicationNames[publicationcode] || '?'} (${vm.countryNames[publicationcode.split('/')[0]]})`;
              },
              label: (tooltipItems, {datasets}) => `${datasets[tooltipItems.datasetIndex].legend} : ${tooltipItems[vm.orientation === 'vertical' ? 'xLabel' : 'yLabel']}${vm.unit === 'percentage' ? '%' : ''}`
            }
          }
        })
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
