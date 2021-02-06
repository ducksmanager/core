<script>
import collectionMixin from "../../mixins/collectionMixin";
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
      required: true
    }
  },
  emits: ['change-dimension'],

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
    this.renderChart({
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
    }, {
      title: {
        display: true,
        text: this.$t("Possession des histoires d'auteurs")
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
</script>

<style scoped>

</style>
