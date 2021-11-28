<script>
import {Pie} from 'vue-chartjs'
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapState} from "pinia";
import l10nMixin from "../../mixins/l10nMixin";
import { coa } from "../../stores/coa";
import { collection } from "../../stores/collection";

export default {
  name: "PublicationStats",
  extends: Pie,
  mixins: [collectionMixin, l10nMixin],

  data: () => ({
    hasPublicationNames: false
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
            title: (tooltipItem, {labels}) => labels[tooltipItem[0].index]
          }
        }
      })
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
