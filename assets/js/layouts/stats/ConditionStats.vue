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

    labels() {
      const vm = this
      return this.l10n && Object.values(this.conditions).map(({l10nKey}) => vm.l10n[l10nKey])
    },

    values() {
      const numberPerCondition = this.collection.reduce((acc, {condition}) => (
        {...acc, [condition || 'indefini']: (acc[condition || 'indefini'] || 0) + 1}
      ), {})
      return Object.values(this.conditions).map(({dbValue}) => numberPerCondition[dbValue])
    },

    colors() {
      return Object.values(this.conditions.map(({color}) => color))
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
      legend: {
        labels: {
          fontColor: '#fff'
        }
      },
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