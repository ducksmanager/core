<script>
import {HorizontalBar} from 'vue-chartjs'
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapGetters, mapState} from "vuex";
import l10nMixin from "../../mixins/l10nMixin";

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

  data: () => ({
    orientation: 'vertical'
  }),

  computed: {
    ...mapState("collection", ["collection"]),
    ...mapState("coa", ["issueCounts"]),
    ...mapGetters("collection", ["totalPerPublication"]),

    labels() {
      return Object.keys(this.totalPerPublication)
    },

    values() {
      if (!(this.totalPerPublication && this.issueCounts && this.countryNames)) {
        return null
      }
      const vm = this
      let possessedIssues = Object.values(this.totalPerPublication);
      let missingIssues = Object.keys(this.issueCounts)
          .filter(publicationCode => vm.labels.includes(publicationCode))
          .map(publicationCode => vm.issueCounts[publicationCode]);
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
    values(newValue) {
      if (newValue) {
        const vm = this
        const {NUMEROS_REFERENCES, POSSESSION_NUMEROS, NUMEROS_POSSEDES} = this.l10n;
        this.renderChart({
          datasets: [
            {
              data: this.values[0],
              backgroundColor: 'orange',
              label: NUMEROS_POSSEDES,
              legend: NUMEROS_POSSEDES
            },
            {
              data: this.values[1],
              backgroundColor: 'green',
              label: NUMEROS_REFERENCES,
              legend: NUMEROS_REFERENCES
            }
          ],
          labels: this.labels,
          legends: [NUMEROS_POSSEDES, NUMEROS_REFERENCES]
        }, {
          title: {
            display: true,
            text: POSSESSION_NUMEROS
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            labels: {
              fontColor: '#fff'
            }
          },
          scales: {
            xAxes: [{
              stacked: true,
              ticks: {
                stepSize: 1
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
              title: tooltipItems => {
                const publicationcode = tooltipItems[0][vm.orientation === 'vertical' ? 'yLabel' : 'xLabel'];
                if (!vm.publicationNames[publicationcode]) {
                  vm.publicationNames[publicationcode] = '?';
                }
                return `${vm.publicationNames[publicationcode] || '?'} (${vm.countryNames[publicationcode.split('/')[0]]})`;
              },
              label: (tooltipItems, data) => `${data.datasets[tooltipItems.datasetIndex].legend} : ${tooltipItems[vm.orientation === 'vertical' ? 'xLabel' : 'yLabel']}${vm.unit === 'percentage' ? '%' : ''}`
            }
          }
        })
      }
    }
  },

  methods: {
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueCounts"])
  }
}
</script>

<style scoped>

</style>