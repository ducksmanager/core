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
    <template v-if="currentCountryCode && currentPublicationCode">
      <EdgeGallery
        v-if="edgeGallery"
        :publicationcode="currentPublicationCode"
        :selected="currentIssueNumber"
        @change="
          currentIssueNumber = $event
          onChange()
        "
      />
      <b-select
        v-else
        v-show="currentCountryCode && currentPublicationCode"
        v-model="currentIssueNumber"
        :options="issuesWithSelect"
        @change="onChange({})"
      />
    </template>
    <dimensions v-if="withDimensions && currentIssueNumber !== null" @change="onChange($event)" />
  </div>
</template>
<script>
import Dimensions from '@/components/Dimensions'
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import { mapActions, mapMutations, mapState } from 'vuex'
import EdgeGallery from '@/components/EdgeGallery'

export default {
  components: { EdgeGallery, Dimensions },
  mixins: [edgeCatalogMixin],
  props: {
    countryCode: { type: String, default: null },
    publicationCode: { type: String, default: null },
    withDimensions: { type: Boolean, default: false },
    disableOngoingOrPublished: { type: Boolean, required: true },
    disableNotOngoingNorPublished: { type: Boolean, required: true },
    edgeGallery: { type: Boolean, default: false },
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
          null: this.$t('Select a country'),
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
          { value: null, text: this.$t('Select an issue number') },
          ...this.issueNumbers[vm.currentPublicationCode].map((issuenumber) => {
            const status = this.getEdgeStatus({
              country: this.currentCountryCode,
              magazine: this.currentPublicationCode.split('/')[1],
              issuenumber,
            })
            return {
              value: issuenumber,
              text: `${issuenumber}${status === 'none' ? '' : ` (${this.$t(status)})`}`,
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
          this.currentPublicationCode = this.publicationCode
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
          const publishedEdges = await this.$axios.$get(`/api/edges/${newValue}`)
          this.addPublishedEdges({
            [newValue]: publishedEdges.reduce(
              (acc, { issuenumber, id, modelId }) => ({
                ...acc,
                [issuenumber]: { id, modelId },
              }),
              {}
            ),
          })
        }
      },
    },
  },
  mounted() {
    if (this.countryCode) {
      this.currentCountryCode = this.countryCode
    }
    this.fetchCountryNames(this.$i18n.locale)
  },
  methods: {
    ...mapActions('coa', [
      'fetchCountryNames',
      'fetchPublicationNamesFromCountry',
      'fetchIssueNumbers',
    ]),
    ...mapMutations('edgeCatalog', ['addPublishedEdges']),

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
<style scoped>
::v-deep select + div {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 3px;
  margin-bottom: 10px;
}
</style>
