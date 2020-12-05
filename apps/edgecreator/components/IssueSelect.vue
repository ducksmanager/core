<template>
  <b-container>
    <b-select
      v-model="currentCountryCode"
      :options="countriesWithSelect"
      @input="loadPublications"
      @change="$emit('change', null)"
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publicationsWithSelect"
      @change="$emit('change', null)"
      @input="loadIssues"
    />
    <b-select
      v-show="currentCountryCode && currentPublicationCode"
      v-model="currentIssueNumber"
      :options="issuesWithSelect"
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
import Dimensions from '@/components/Dimensions'
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import { mapActions, mapMutations, mapState } from 'vuex'

export default {
  components: { Dimensions },
  mixins: [edgeCatalogMixin],
  props: {
    countryCode: { type: String, default: null },
    publicationCode: { type: String, default: null },
    withDimensions: { type: Boolean, default: false },
    disableOngoingOrPublished: { type: Boolean, required: true },
    disableNotOngoingNorPublished: { type: Boolean, required: true },
  },
  data: () => ({
    currentCountryCode: null,
    currentPublicationCode: null,
    currentIssueNumber: null,
  }),
  computed: {
    ...mapState('coa', ['countries', 'publications', 'issues']),
    ...mapState('edgeCatalog', ['publishedEdges']),

    countriesWithSelect() {
      return (
        this.countries &&
        this.countries[this.$i18n.locale] && {
          null: this.$t('select.country'),
          ...this.countries[this.$i18n.locale],
        }
      )
    },
    publicationsWithSelect() {
      return (
        this.publications[this.currentCountryCode] && {
          null: this.$t('select.publication'),
          ...this.publications[this.currentCountryCode],
        }
      )
    },
    issuesWithSelect() {
      const vm = this
      return (
        this.issues[this.currentPublicationCode] &&
        this.publishedEdges[this.currentPublicationCode] && [
          { value: null, text: this.$t('select.issue') },
          ...this.issues[vm.currentPublicationCode].map((issuenumber) => {
            const status = this.getEdgeStatus({
              country: this.currentCountryCode,
              magazine: this.currentPublicationCode.split('/')[1],
              issuenumber,
            })
            return {
              value: issuenumber,
              text: `${issuenumber}${status === 'none' ? '' : ` (${status})`}`,
              disabled:
                (this.disableOngoingOrPublished && status !== 'none') ||
                (this.disableNotOngoingNorPublished && status === 'none'),
            }
          }),
        ]
      )
    },
  },
  watch: {
    currentCountryCode: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          this.currentPublicationCode = null
          this.currentIssueNumber = null
          await this.loadPublicationsByCountry(newValue)
        }
      },
    },
    currentPublicationCode: {
      immediate: true,
      async handler(newValue) {
        this.currentIssueNumber = null
        await this.loadIssues(newValue)
        this.setPublishedEdges({
          publicationCode: newValue,
          publishedEdges: await this.$axios.$get(`/api/edges/${newValue}`),
        })
      },
    },
  },
  mounted() {
    if (this.countryCode) {
      this.currentCountryCode = this.countryCode
    }
    if (this.publicationCode) {
      this.currentPublicationCode = this.publicationCode
    }
    this.loadCountries()
  },
  methods: {
    ...mapActions('coa', ['loadCountries', 'loadPublicationsByCountry', 'loadIssues']),
    ...mapMutations('edgeCatalog', ['setPublishedEdges']),
  },
}
</script>
<style scoped></style>
