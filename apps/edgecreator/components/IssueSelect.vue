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
      <template v-if="edgeGallery">
        <EdgeGallery
          v-if="isCatalogLoaded"
          :publicationcode="currentPublicationCode"
          :selected="currentIssueNumber"
          @change="
            currentIssueNumber = $event
            onChange({})
          "
        />
        <b-alert v-else show variant="info">{{ $t('Loading...') }} </b-alert>
      </template>
      <template v-else>
        <b-select
          v-show="currentCountryCode && currentPublicationCode"
          v-model="currentIssueNumber"
          :options="issuesWithSelect"
          @input="onChange({})"
        />
        <template v-if="canBeMultiple && currentIssueNumber !== null">
          <b-form-group class="mt-2">
            <b-form-radio v-model="editMode" name="editMode" value="single"
              >Edit a single edge</b-form-radio
            >
            <b-form-radio v-model="editMode" name="editMode" value="range"
              >Edit a range of edges (e.g. issues 1 to 3)</b-form-radio
            >
          </b-form-group>
          <b-select
            v-show="editMode === 'range'"
            v-model="currentIssueNumberEnd"
            :options="issuesWithSelect"
            @input="onChange({})"
          />
        </template>
      </template>
    </template>
    <dimensions
      v-if="dimensions && currentIssueNumber !== null"
      :width="dimensions.width"
      :height="dimensions.height"
      @change="onChange($event)"
    />
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
    canBeMultiple: { type: Boolean, default: false },
    dimensions: { type: Object, default: null },
    disableOngoingOrPublished: { type: Boolean, required: true },
    disableNotOngoingNorPublished: { type: Boolean, required: true },
    edgeGallery: { type: Boolean, default: false },
  },
  data: () => ({
    currentCountryCode: null,
    currentPublicationCode: null,
    currentIssueNumber: null,
    currentIssueNumberEnd: null,
    editMode: 'single',
  }),
  computed: {
    ...mapState('coa', ['countryNames', 'publicationNames', 'issueNumbers']),
    ...mapState('edgeCatalog', ['publishedEdges']),

    countriesWithSelect() {
      return (
        this.countryNames && [
          { value: null, text: this.$t('Select a country') },
          ...Object.keys(this.countryNames).map((countryName) => ({
            value: countryName,
            text: this.countryNames[countryName],
          })),
        ]
      )
    },
    publicationsWithSelect() {
      const vm = this
      return (
        this.publicationNames &&
        Object.keys(this.publicationNames)
          .filter(
            (publicationCode) =>
              publicationCode.indexOf(`${vm.currentCountryCode}/`) === 0
          )
          .map((publicationCode) => ({
            text: vm.publicationNames[publicationCode],
            value: publicationCode,
          }))
          .sort(({ text: text1 }, { text: text2 }) =>
            text1 < text2 ? -1 : text2 < text1 ? 1 : 0
          )
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
              text: `${issuenumber}${
                status === 'none' ? '' : ` (${this.$t(status)})`
              }`,
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
          const publishedEdges = await this.$axios.$get(
            `/api/edges/${newValue}`
          )
          this.addPublishedEdges({
            [newValue]: publishedEdges.reduce(
              (acc, { issuenumber, id, modelId }) => ({
                ...acc,
                ...(modelId ? { [issuenumber]: { id, modelId } } : {}),
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
        editMode: this.editMode,
        countryCode: this.currentCountryCode,
        publicationCode: this.currentPublicationCode,
        issueNumber: this.currentIssueNumber,
        issueNumberEnd: this.currentIssueNumberEnd,
      })
    },
  },
}
</script>
<style scoped lang="scss">
::v-deep select + div {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 3px;
  margin-bottom: 10px;
}
::v-deep .custom-control-input[type='checkbox'] {
  position: static;
  width: 2rem;
}
</style>
