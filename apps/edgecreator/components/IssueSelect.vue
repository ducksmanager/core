<template>
  <b-container>
    <b-select
      v-model="currentCountryCode"
      :options="countries"
      @input="loadPublications"
      @change="$emit('change', null)"
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publications[currentCountryCode]"
      @change="$emit('change', null)"
      @input="loadIssues"
    />
    <b-select
      v-show="currentCountryCode && currentPublicationCode"
      v-model="currentIssueNumber"
      :options="issues[currentPublicationCode]"
      @change="$emit('change', null)"
    />
    <dimensions
      v-if="withDimensions && currentIssueNumber !== null"
      @change="
        $emit('change', {
          ...$event,
          countryCode: currentCountryCode,
          publicationCode: currentPublicationCode,
          issueNumber: currentIssueNumber,
        })
      "
    />
  </b-container>
</template>
<script>
import Vue from 'vue'
import Dimensions from '@/components/Dimensions'

export default {
  components: { Dimensions },
  props: {
    withDimensions: { type: Boolean, default: false },
  },
  data: () => ({
    currentCountryCode: null,
    currentPublicationCode: null,
    currentIssueNumber: null,
    countries: null,
    issues: {},
    publications: {},
  }),
  mounted() {
    this.loadCountries()
  },
  methods: {
    async loadCountries() {
      if (!this.countries) {
        this.countries = {
          null: this.$t('select.country'),
          ...(await this.$axios.$get(`/api/coa/list/countries/${this.$i18n.locale}`)),
        }
      }
      this.currentIssueNumber = null
    },
    async loadPublications() {
      const country = this.currentCountryCode
      if (!this.publications[country]) {
        const publications = {
          null: this.$t('select.publication'),
          ...(await this.$axios.$get(`/api/coa/list/publications/${country}`)),
        }
        Vue.set(this.publications, country, publications)
      }
      this.currentIssueNumber = null
    },
    async loadIssues() {
      const publicationCode = this.currentPublicationCode
      if (publicationCode) {
        if (!this.issues[publicationCode]) {
          let issues = Object.values(
            await this.$axios.$get(`/api/coa/list/issues/${publicationCode}`)
          )
          issues = [{ value: null, text: this.$t('select.issue') }].concat(issues)
          Vue.set(this.issues, publicationCode, issues)
        }
        this.currentIssueNumber = null
      }
    },
  },
}
</script>
<style scoped></style>
