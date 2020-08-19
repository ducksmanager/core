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
      @change="
        $emit('change', {
          countryCode: currentCountryCode,
          publicationCode: currentPublicationCode,
          issueNumber: currentIssueNumber,
        })
      "
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
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import { mapMutations } from 'vuex'

export default {
  components: { Dimensions },
  mixins: [edgeCatalogMixin],
  props: {
    withDimensions: { type: Boolean, default: false },
    disableOngoingOrPublished: { type: Boolean, required: true },
    disableNotOngoingNorPublished: { type: Boolean, required: true },
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
          const publishedEdges = await this.$axios.$get(`/api/edges/${publicationCode}`)
          this.setPublishedEdges({ publicationCode, publishedEdges })
          let issues = Object.values(
            await this.$axios.$get(`/api/coa/list/issues/${publicationCode}`)
          ).map((issuenumber) => {
            const status = this.getEdgeStatus({
              country: this.currentCountryCode,
              magazine: publicationCode.split('/')[1],
              issuenumber,
            })
            return {
              value: issuenumber,
              text: `${issuenumber}${status === 'none' ? '' : ` (${status})`}`,
              disabled:
                (this.disableOngoingOrPublished && status !== 'none') ||
                (this.disableNotOngoingNorPublished && status === 'none'),
            }
          })
          issues = [{ value: null, text: this.$t('select.issue') }].concat(issues)
          Vue.set(this.issues, publicationCode, issues)
        }
        this.currentIssueNumber = null
      }
    },
    ...mapMutations('edgeCatalog', ['setPublishedEdges']),
  },
}
</script>
<style scoped></style>
