<template>
  <div>
    <b-select
      v-model="currentCountryCode"
      :options="countriesWithSelect"
      @change="$emit('change', null)"
    />
    <b-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publicationsWithSelect"
      @change="$emit('change', null)"
    />
    <b-select
      v-show="currentCountryCode && currentPublicationCode"
      v-model="currentIssueNumber"
      :options="issuesWithSelect"
      @change="onChange({})"
    />
    <dimensions v-if="withDimensions && currentIssueNumber !== null" @change="onChange($event)" />
  </div>
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
    ...mapState('coa', ['countryNames', 'publicationNames', 'issueNumbers']),
    ...mapState('edgeCatalog', ['publishedEdges']),

    countriesWithSelect() {
      return (
        this.countryNames && {
          null: this.$t('select.country'),
          ...this.countryNames,
        }
      )
    },
    publicationsWithSelect() {
      const vm = this
      return (
        this.publicationNames &&
        Object.keys(this.publicationNames)
          .filter((publicationCode) => publicationCode.indexOf(`${vm.currentCountryCode}/`) === 0)
          .map((publicationCode) => ({
            text: vm.publicationNames[publicationCode],
            value: publicationCode,
          }))
          .sort(({ text: text1 }, { text: text2 }) => (text1 < text2 ? -1 : text2 < text1 ? 1 : 0))
      )
    },
    issuesWithSelect() {
      const vm = this
      return (
        this.issueNumbers &&
        this.issueNumbers[this.currentPublicationCode] &&
        this.publishedEdges[this.currentPublicationCode] && [
          { value: null, text: this.$t('select.issue') },
          ...this.issueNumbers[vm.currentPublicationCode].map((issuenumber) => {
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

          await this.fetchPublicationNamesFromCountry(newValue)
        }
      },
    },
    currentPublicationCode: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          this.currentIssueNumber = null
          await this.fetchIssueNumbers([newValue])
          this.setPublishedEdges({
            publicationCode: newValue,
            publishedEdges: await this.$axios.$get(`/api/edges/${newValue}`),
          })
        }
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
    this.fetchCountryNames()
  },
  methods: {
    ...mapActions('coa', [
      'fetchCountryNames',
      'fetchPublicationNamesFromCountry',
      'fetchIssueNumbers',
    ]),
    ...mapMutations('edgeCatalog', ['setPublishedEdges']),

    onChange(data) {
      this.$emit('change', {
        ...data,
        countryCode: this.currentCountryCode,
        publicationCode: this.currentPublicationCode,
        issueNumber: this.currentIssueNumber,
      })
    },
  },
}
</script>
<style scoped></style>
