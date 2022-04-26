<template>
  <PieChart
    :chart-data="chartData"
    :options="options"
  />
</template>
<script>
import {collection} from "../../composables/collection";
import {mapState} from "pinia";
import {condition} from "../../composables/condition";
const {collection: collectionStore} = require("../../stores/collection");
import {PieChart} from "vue-chart-3";

import {ArcElement, Chart, Legend, PieController, Title, Tooltip} from 'chart.js';
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

let conditions

export default {
  name: "ConditionStats",
  components: {PieChart},

  setup() {
    conditions = condition().conditions
    collection().load()
  },

  computed: {
    ...mapState(collectionStore, ["collection"]),

    conditionsWithoutMissing() {
      return conditions.filter(({value}) => value !== 'missing')
    },

    values() {
      const numberPerCondition = this.collection.reduce((acc, {condition}) => (
        {...acc, [condition || 'indefini']: (acc[condition || 'indefini'] || 0) + 1}
      ), {})
      return Object.values(this.conditionsWithoutMissing).map(({dbValue}) => numberPerCondition[dbValue])
    },

    colors() {
      return Object.values(this.conditionsWithoutMissing.map(({color}) => color))
    },

    chartData() {
      return {
        labels: Object.values(this.conditionsWithoutMissing).map(({text}) => text),
        datasets: [{
          data: this.values,
          backgroundColor: this.colors
        }]
      }
    },

    options() {
      const vm = this
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: tooltipItem => {
                const {dataset, parsed: currentValue} = tooltipItem;
                const total = dataset.data.reduce((acc, value) => acc+value, 0);
                const percentage = parseFloat((currentValue / total * 100).toFixed(1));
                return `${currentValue} (${percentage}%)`;
              },
              title: ([tooltipItem]) => vm.chartData.labels[tooltipItem.dataIndex],
            }
          }
        }
      }
    }
  },
}
</script>

<style scoped>

</style>
