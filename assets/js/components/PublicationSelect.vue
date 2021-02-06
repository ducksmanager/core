<template>
  <div>
    <b-select
      v-model="currentCountryCode"
      :options="countryNames"
      required
      @input="fetchPublicationNamesFromCountry(currentCountryCode)"
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      name="publicationCode"
      required
      :options="publicationNamesForCurrentCountry"
      @input="$emit('input', currentPublicationCode)"
    />
    <b-btn
      v-if="!noButton"
      :disabled="!currentPublicationCode"
      :href="$r(`/collection/show/{publicationCode:${currentPublicationCode}}`)"
    >
      {{ $t('OK') }}
    </b-btn>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "PublicationSelect",

  mixins: [l10nMixin],

  props: {
    noButton: {
      type: Boolean,
      default: false
    }
  },
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
          ).map(publicationCode => ({
            text: vm.publicationNames[publicationCode],
            value: publicationCode
          }))
          .sort(({text: text1}, {text: text2}) => text1.localeCompare(text2))
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
