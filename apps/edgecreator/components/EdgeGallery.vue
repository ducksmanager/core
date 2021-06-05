<template>
  <Gallery
    v-if="items"
    image-type="edges"
    :loading="isPopulating"
    :selected="selected == null ? [] : [selected]"
    :items="items"
    :allow-upload="false"
    @change="$emit('change', $event)"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Gallery from '@/components/Gallery'
import modelLoadMixin from '@/mixins/modelLoadMixin'

export default {
  name: 'EdgeGallery',
  components: { Gallery },
  mixins: [modelLoadMixin],
  props: {
    publicationcode: { type: String, required: true },
    selected: { type: String, default: null },
  },
  data: () => ({
    items: [],
    isPopulating: false,
  }),
  computed: {
    ...mapState('edgeCatalog', ['publishedEdges', 'publishedEdgesSteps']),
    ...mapState('coa', ['issueNumbers']),
  },
  watch: {
    publishedEdges: {
      immediate: true,
      deep: true,
      async handler(publishedEdges) {
        if (publishedEdges[this.publicationcode]) {
          if (!this.isPopulating) {
            this.isPopulating = true
            await this.populateItems(this.publicationcode, publishedEdges[this.publicationcode])
            this.isPopulating = false
          }
        }
      },
    },
    publicationcode: {
      immediate: true,
      async handler(publicationcode) {
        if (this.publishedEdges[publicationcode]) {
          if (!this.isPopulating) {
            this.isPopulating = true
            await this.populateItems(publicationcode, this.publishedEdges[publicationcode])
            this.isPopulating = false
          }
        }
      },
    },
  },
  methods: {
    async populateItems(publicationcode, items) {
      const vm = this
      const [countryCode, magazineCode] = publicationcode.split('/')
      const publishedIssueModels = Object.values(items)
        .map(({ modelId }) => modelId)
        .filter((modelId) => !!modelId)
      await this.getPublishedEdgesSteps({
        publicationcode: this.publicationcode,
        edgeModelIds: publishedIssueModels,
      })
      this.items = (
        await Promise.all(
          Object.keys(items).map(async (issuenumber) => {
            let quality
            let tooltip
            const allSteps =
              vm.publishedEdgesSteps[vm.publicationcode] &&
              vm.publishedEdgesSteps[vm.publicationcode][issuenumber]
            if (!allSteps) {
              quality = 0
              tooltip = 'No steps or dimensions found'
            } else {
              const issueStepWarnings = {}
              const dimensions = vm.getDimensionsFromApi(allSteps, null)
              if (!dimensions) {
                issueStepWarnings[-1] = 'No dimensions'
              }
              const issueSteps = await vm.getStepsFromApi(
                issuenumber,
                allSteps,
                dimensions,
                (error, stepNumber) => {
                  if (!issueStepWarnings[stepNumber]) {
                    issueStepWarnings[stepNumber] = []
                  }
                  issueStepWarnings[stepNumber].push(`Step ${stepNumber}: ${error}`)
                }
              )
              if (!issueSteps.length) {
                issueStepWarnings[0] = 'No steps'
                quality = 0
              } else {
                quality = 1 - Object.keys(issueStepWarnings).length / issueSteps.length
              }
              tooltip = Object.values(issueStepWarnings).join('\n')
            }
            return {
              name: issuenumber,
              quality,
              disabled: quality === 0,
              tooltip,
              url: `${process.env.EDGES_URL}/${countryCode}/gen/${magazineCode}.${issuenumber}.png`,
            }
          })
        )
      ).sort(({ name: name1 }, { name: name2 }) =>
        Math.sign(
          vm.issueNumbers[vm.publicationcode].indexOf(name1) -
            vm.issueNumbers[vm.publicationcode].indexOf(name2)
        )
      )
    },
    ...mapActions('edgeCatalog', ['getPublishedEdgesSteps']),
  },
}
</script>

<style scoped></style>
