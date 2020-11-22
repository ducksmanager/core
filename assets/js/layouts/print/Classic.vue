<template>
  <div
    v-if="collection && countryNames && publicationNames"
    class="list"
  >
    <div
      v-for="country in countryCodesSortedByName"
      :key="country"
    >
      <div class="country">
        {{ countryNames[country] }}
      </div>
      <div
        v-for="publicationCode in publicationCodesOfCountry(country)"
        :key="publicationCode"
      >
        <u>{{ publicationNames[publicationCode] || publicationCode }}</u>
        {{ issuesOfPublicationCode(publicationCode) }}
        <br>
      </div>
    </div>
  </div>
</template>
<script>
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapState} from "vuex";

export default {
  mixins: [collectionMixin],
  computed: {
    ...mapState("coa", ["countryNames", "publicationNames"]),
    countryCodes() {
      return this.collection && [...new Set(this.collection.map(i => i.country))]
    },
    countryCodesSortedByName() {
      const vm = this
      return this.countryCodes && this.countryNames && [...this.countryCodes]
        .sort((countryCodeA, countryCodeB) => vm.countryNames[countryCodeA] < vm.countryNames[countryCodeB] ? -1 : 1)
    },
    publicationCodes() {
      return this.collection && [...new Set(this.collection.map(i => `${i.country}/${i.magazine}`))]
    },
  },

  watch: {
    publicationCodes: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchPublicationNames(newValue)
        }
      }
    }
  },

  async mounted() {
    await this.fetchCountryNames()
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),
    publicationCodesOfCountry(countryCode) {
      const vm = this
      return this.publicationCodes.filter(publicationCode => publicationCode.split('/')[0] === countryCode)
          .sort((a, b) => !vm.publicationNames[b] ? 1 : vm.publicationNames[a] < vm.publicationNames[b] ? -1 : vm.publicationNames[a] > vm.publicationNames[b] ? 1 : 0)
    },
    issuesOfPublicationCode(publicationCode) {
      return this.collection
        .filter(i => publicationCode === `${i.country}/${i.magazine}`)
        .map(({issueNumber}) => issueNumber).join(', ')
    }
  },
}
</script>

<style>
.list {
  padding: 10px;
}
.country {
  font-weight: bold;
  font-style: italic;
  margin: 10px 0 5px 0;
}
</style>