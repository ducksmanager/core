<template>
  <div>
    <b-select
      v-model="currentCountryCode"
      :options="countryNames"
      @input="fetchPublicationNamesFromCountry(currentCountryCode)"
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publicationNames[currentCountryCode]"
    />
    <b-btn
      variant="default"
      :disabled="currentPublicationCode"
      @click="$emit('input', currentPublicationCode)"
    >
      {{ l10n.OK }}
    </b-btn>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: "PublicationSelect",
  emits: ['input'],

  data: () => ({
    currentCountryCode: null,
    currentPublicationCode: null,
  }),

  computed: {
    ...mapState("coa", ["countryNames", "publicationNames"])
  },

  mounted() {
    this.fetchCountryNames()
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNamesFromCountry"])
  }
}
</script>

<style scoped>

</style>