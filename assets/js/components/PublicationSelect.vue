<template>
  <div v-if="l10n">
    <b-select
      v-model="currentCountryCode"
      :options="countryNames"
      @input="fetchPublicationNamesFromCountry(currentCountryCode)"
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publicationNamesForCurrentCountry"
    />
    <b-btn
      :disabled="!currentPublicationCode"
      :href="`/collection/show/${currentPublicationCode}`"
    >
      {{ l10n.OK }}
    </b-btn>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "PublicationSelect",

  mixins: [l10nMixin],
  emits: ['input'],

  data: () => ({
    currentCountryCode: null,
    currentPublicationCode: null,
  }),

  computed: {
    ...mapState("coa", ["countryNames", "publicationNames", "publicationNamesFullCountries"]),
    publicationNamesForCurrentCountry() {
      const vm = this
      return this.publicationNamesFullCountries.includes(this.currentCountryCode)
        ? Object.keys(this.publicationNames)
          .filter(publicationCode =>
            new RegExp(`^${vm.currentCountryCode}/`).test(publicationCode)
          ).reduce((acc, publicationCode) => ({
            ...acc,
            [publicationCode]: vm.publicationNames[publicationCode]
          }), {})
        : []
    }
  },

  mounted() {
    this.fetchCountryNames()
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNamesFromCountry"]),
  }
}
</script>

<style scoped>

</style>