<script>
import {Pie} from 'vue-chartjs'
import collectionMixin from "../../mixins/collectionMixin";
import {mapState} from "vuex";
import l10nMixin from "../../mixins/l10nMixin";
import conditionMixin from "../../mixins/conditionMixin";

export default {
  name: "ConditionStats",
  extends: Pie,
  mixins: [collectionMixin, l10nMixin, conditionMixin],

  computed: {
    ...mapState("collection", ["collection"]),

    conditionsWithoutMissing() {
      return this.conditions.filter(({value}) => value !== 'missing')
    },

    labels() {
      const vm = this
      return Object.values(this.conditionsWithoutMissing).map(({text}) => text)
    },

    values() {
      const numberPerCondition = this.collection.reduce((acc, {condition}) => (
        {...acc, [condition || 'indefini']: (acc[condition || 'indefini'] || 0) + 1}
      ), {})
      return Object.values(this.conditionsWithoutMissing).map(({dbValue}) => numberPerCondition[dbValue])
    },

    colors() {
      return Object.values(this.conditionsWithoutMissing.map(({color}) => color))
    }
  },

  mounted() {
    this.renderChart({
      datasets: [{
        data: this.values,
        backgroundColor: this.colors
      }],
      labels: this.labels
    }, {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          label: (tooltipItem, {datasets}) => {
            const dataset = datasets[tooltipItem.datasetIndex];
            const total = dataset._meta[Object.keys(dataset._meta)[0]].total;
            const currentValue = dataset.data[tooltipItem.index];
            const percentage = parseFloat((currentValue / total * 100).toFixed(1));
            return `${currentValue} (${percentage}%)`;
          },
          title: ([tooltipItem], {labels}) => labels[tooltipItem.index]
        }
      }
    })
  }
}
</script>

<style scoped>

</style>
