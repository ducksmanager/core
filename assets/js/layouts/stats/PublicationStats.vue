<template>
  <PieChart
    v-if="chartData"
    :chart-data="chartData"
    :options="options"
  />
</template>

<script>
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapState} from "pinia";
import l10nMixin from "../../mixins/l10nMixin";
import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";
import {PieChart} from "vue-chart-3";

import {ArcElement, Chart, Legend, PieController, Title, Tooltip} from 'chart.js';
Chart.register(Legend, PieController, Tooltip, Title, ArcElement);

export default {
  name: "PublicationStats",
  components: {PieChart},
  mixins: [collectionMixin, l10nMixin],

  data: () => ({
    hasPublicationNames: false,
    chartData: null,
    options: {}
  }),

  computed: {
    ...mapState(collection, ["collection", "totalPerPublication"]),
    ...mapState(coa, ["publicationNames"]),
    smallCountPublications() {
      if (!this.totalPerPublication) {
        return null;
      }
      const vm = this
      return Object.keys(this.totalPerPublication).filter(publicationCode =>
          vm.totalPerPublication[publicationCode] / vm.collection.length < 0.01)
    },
    totalPerPublicationGroupSmallCounts() {
      const vm = this
      return this.smallCountPublications && {
        ...Object.keys(this.totalPerPublication)
            .filter(publicationCode => !vm.smallCountPublications.includes(publicationCode))
            .reduce((acc, publicationCode) =>
                    ({...acc, [publicationCode]: vm.totalPerPublication[publicationCode]})
                , {}),
        [null]: this.smallCountPublications.reduce((acc, publicationCode) => {
          return acc + vm.totalPerPublication[publicationCode]
        }, 0)
      }
    },

    labels() {
      const vm = this
      return this.hasPublicationNames && Object.keys(this.totalPerPublicationGroupSmallCounts)
          .sort(this.sortByCount)
          .reduce((acc, publicationCode) => [
            ...acc,
            vm.publicationNames[publicationCode]
            || `${this.$t('Autres')} (${this.smallCountPublications.length} ${this.$t('Publications').toLowerCase()})`
          ], [])
    },

    values() {
      return Object.values(this.totalPerPublicationGroupSmallCounts)
          .sort((count1, count2) => Math.sign(count1 - count2))
    },

    colors() {
      const vm = this
      return this.totalPerPublicationGroupSmallCounts && Object.keys(this.totalPerPublicationGroupSmallCounts)
          .sort(this.sortByCount)
          .map(publicationCode => publicationCode === 'null' ? '#000' : vm.randomColor())
    }
  },

  watch: {
    totalPerPublicationGroupSmallCounts: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchPublicationNames(Object.keys(this.totalPerPublicationGroupSmallCounts)
            .filter(publicationCode => publicationCode !== 'null')
          )
          this.hasPublicationNames = true
        }
      }
    },
    labels() {
      const vm = this
      this.chartData = {
        datasets: [{
          data: this.values,
          backgroundColor: this.colors
        }],
        labels: this.labels
      }

      this.options = {
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

  methods: {
    ...mapActions(coa, ["fetchPublicationNames"]),
    randomColor: () => `rgb(${[Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)].join(',')})`,

    sortByCount(publicationCode1, publicationCode2) {
      return Math.sign(this.totalPerPublicationGroupSmallCounts[publicationCode1] - this.totalPerPublicationGroupSmallCounts[publicationCode2])
    }
  }
}
</script>

<style scoped>

</style>
