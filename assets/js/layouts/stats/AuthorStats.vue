<script>
import collectionMixin from "../../mixins/collectionMixin";
import {mapGetters, mapState} from "vuex";
import l10nMixin from "../../mixins/l10nMixin";
import {Bar} from "vue-chartjs";

export default {
  name: "AuthorStats",
  extends: Bar,
  mixins: [collectionMixin, l10nMixin],

  props: {
    unit: {
      type: String,
      required: true
    },
    watchedAuthorsStoryCount: {
      type: Object,
      default: null
    }
  },
  emits: ['change-dimension'],

  computed: {
    ...mapState("collection", ["collection"]),
    ...mapState("coa", ["issueCounts"]),
    ...mapGetters("collection", ["totalPerPublication"]),

    labels() {
      return this.watchedAuthorsStoryCount && Object.values(this.watchedAuthorsStoryCount).map(({fullname: fullName}) => fullName)
    },

    values() {
      if (!this.watchedAuthorsStoryCount) {
        return null;
      }
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

  watch: {
    labels: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.$emit('change-dimension', 'width', 250 + 50 * newValue.length);
        }
      }
    },
    values(newValue) {
      if (newValue) {
        const vm = this
        const {HISTOIRES_NON_POSSEDEES, POSSESSION_HISTOIRES_AUTEURS, HISTOIRES_POSSEDEES} = this.l10n;
        this.renderChart({
          datasets: [
            {
              data: this.values[0],
              backgroundColor: '#FF8000',
              label: HISTOIRES_POSSEDEES,
              legend: HISTOIRES_POSSEDEES
            },
            {
              data: this.values[1],
              backgroundColor: '#04B404',
              label: HISTOIRES_NON_POSSEDEES,
              legend: HISTOIRES_NON_POSSEDEES
            }
          ],
          labels: this.labels,
          legends: [HISTOIRES_POSSEDEES, HISTOIRES_NON_POSSEDEES]
        }, {
          title: {
            display: true,
            text: POSSESSION_HISTOIRES_AUTEURS
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
          tooltips: {
            enabled: true,
            mode: 'label',
            callbacks: {
              title: ([tooltip]) => tooltip.label,
              label: (tooltipItems, {datasets}) =>
                  `${datasets[tooltipItems.datasetIndex].legend} : ${tooltipItems.yLabel}${vm.unit === 'percentage' ? '%' : ''}`
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>