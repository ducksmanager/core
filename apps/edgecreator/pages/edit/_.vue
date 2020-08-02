<template>
  <b-container v-if="error" id="wrapper" fluid>
    {{ error }}
  </b-container>
  <b-container v-else-if="width && height" id="wrapper" fluid>
    <top-bar />
    <b-row class="flex-grow-1 pt-2" align-h="end">
      <b-col class="text-right">
        <table class="edges">
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              <published-edge :issuenumber="edgesBefore[edgesBefore.length - 1].issuenumber" />
            </td>
            <template v-for="issuenumber in issuenumbers">
              <td :key="issuenumber">
                <edge-canvas
                  :issuenumber="issuenumber"
                  :width="width"
                  :height="height"
                  :steps="steps"
                  :photo-urls="photoUrls[issuenumber]"
                  :contributors="contributors"
                />
              </td>
              <td v-if="showEdgePhotos && hasPhotoUrl(issuenumber)" :key="issuenumber">
                <img :src="photoUrls[issuenumber][0]" :style="{ height: `${zoom * height}px` }" />
              </td>
            </template>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge :issuenumber="edgesAfter[0].issuenumber" />
            </td>
          </tr>
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <template v-for="issuenumber in issuenumbers">
              <th :key="issuenumber">{{ issuenumber }}<br />&#11088;</th>
              <th v-if="showEdgePhotos && hasPhotoUrl(issuenumber)" :key="issuenumber">
                <b-icon-camera />
              </th>
            </template>
            <th v-if="showNextEdge && edgesAfter.length">
              {{ edgesAfter[0].issuenumber }}
            </th>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <model-edit
          @add-step="
            (component) => {
              addStep({
                component,
                svgGroupElement: null,
              })
            }
          "
        />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'

import { BIconCamera } from 'bootstrap-vue'
import TopBar from '@/components/TopBar'
import EdgeCanvas from '@/components/EdgeCanvas'
import PublishedEdge from '@/components/PublishedEdge'
import ModelEdit from '@/components/ModelEdit'

const DOMParser = require('xmldom').DOMParser

export default {
  name: 'Edit',
  components: {
    TopBar,
    EdgeCanvas,
    PublishedEdge,
    ModelEdit,
    BIconCamera,
  },
  async fetch() {
    this.setAllUsers((await this.$axios.$get(`/api/ducksmanager/users`)).users)
  },
  data() {
    return {
      error: null,
    }
  },
  computed: {
    zoom: {
      get() {
        return this.$store.state.zoom
      },
      set(value) {
        this.$store.commit('setZoom', value)
      },
    },
    ...mapState([
      'zoom',
      'width',
      'height',
      'steps',
      'country',
      'magazine',
      'issuenumbers',
      'edgesBefore',
      'edgesAfter',
      'photoUrls',
      'contributors',
    ]),
    ...mapState('renders', ['supportedRenders']),
    ...mapState('ui', ['showIssueNumbers', 'showPreviousEdge', 'showNextEdge', 'showEdgePhotos']),
    ...mapState('user', ['allUsers']),
  },
  watch: {
    async issuenumbers(newValue) {
      if (newValue) {
        this.loadGalleryItems()
        this.loadSurroundingEdges()
      }
    },
  },
  async mounted() {
    const vm = this
    const [country, magazine, issuenumberMin, , issuenumberMax] = vm.$route.params.pathMatch.split(
      '/'
    )
    if ([country, magazine, issuenumberMin].includes(undefined)) {
      this.error = 'Invalid URL'
      return
    }
    this.setCountry(country)
    this.setMagazine(magazine)
    this.setEditIssuenumber(issuenumberMin)

    await this.loadPublicationIssues()

    this.setIssuenumbersFromMinMax({ min: issuenumberMin, max: issuenumberMax })

    await this.$axios
      .$get(this.getEdgeUrl(issuenumberMin, 'svg'))
      .then((data) => {
        const doc = new DOMParser().parseFromString(data, 'image/svg+xml')
        const svgElement = doc.getElementsByTagName('svg')[0]
        const svgChildNodes = Object.values(svgElement.childNodes)

        vm.setDimensionsFromSvg(svgElement)
        vm.setStepsFromSvg(svgChildNodes)
        vm.setPhotoUrlsFromSvg(svgChildNodes)
        vm.setContributorsFromSvg(svgChildNodes)
      })
      .catch(async () => {
        const edge = await this.$axios.$get(
          `/api/edgecreator/v2/model/${country}/${magazine}/${issuenumberMin}`
        )
        if (!edge) {
          vm.setSteps([])
          return
        }
        const steps = (await vm.$axios.$get(`/api/edgecreator/v2/model/${edge.id}/steps`)) || []

        vm.setDimensionsFromApi(steps)
        vm.setStepsFromApi(steps)
        await vm.setPhotoUrlsFromApi(edge.id, issuenumberMin)
        await vm.setContributorsFromApi(edge.id)
      })
  },
  methods: {
    getFromSvgMetadata(svgChildNodes, metadataType) {
      return svgChildNodes
        .filter(
          (node) =>
            node.nodeName === 'metadata' &&
            node.attributes.getNamedItem('type').nodeValue === metadataType
        )
        .map((metadataNode) => metadataNode.textContent.trim())
    },
    setDimensionsFromSvg(svgElement) {
      this.setDimensions({
        width: svgElement.getAttribute('width') / 1.5,
        height: svgElement.getAttribute('height') / 1.5,
      })
    },
    setStepsFromSvg(svgChildNodes) {
      this.setSteps(
        svgChildNodes
          .filter((node) => node.nodeName === 'g')
          .map((group) => ({
            component: group.getAttribute('class'),
            svgGroupElement: group,
          }))
      )
    },
    setPhotoUrlsFromSvg(svgChildNodes) {
      const vm = this
      vm.getFromSvgMetadata(svgChildNodes, 'photo').forEach((photoUrl) => {
        vm.addPhotoUrl({ issuenumber: vm.issuenumbers[0], filename: photoUrl })
      })
    },
    setContributorsFromSvg(svgChildNodes) {
      const vm = this
      const contributionTypes = ['photographer', 'designer']
      contributionTypes.forEach((contributionType) => {
        vm.getFromSvgMetadata(svgChildNodes, `contributor-${contributionType}`).forEach(
          (username) => {
            vm.addContributor({ contributionType: `${contributionType}s`, user: { username } })
          }
        )
      })
    },

    setDimensionsFromApi(stepData) {
      const dimensions = stepData.find((step) => step.ordre === -1)
      if (dimensions) {
        this.setDimensions({
          width: dimensions.options.Dimension_x,
          height: dimensions.options.Dimension_y,
        })
      }
    },
    setStepsFromApi(stepData) {
      const vm = this
      this.setSteps(
        stepData
          .filter((step) => step.ordre !== -1)
          .map((step) => ({
            component: vm.supportedRenders.find(
              (component) => component.originalName === step.nomFonction
            ).component,
            dbOptions: step.options,
          }))
      )
    },
    async setPhotoUrlsFromApi(edgeId, issuenumber) {
      const photo = await this.$axios.$get(`/api/edgecreator/model/v2/${edgeId}/photo/main`)
      if (photo) {
        this.addPhotoUrl({ issuenumber, filename: photo.nomfichier })
      }
    },
    async setContributorsFromApi(edgeId) {
      const vm = this
      const contributors = await vm.$axios.$get(`/api/edgecreator/contributors/${edgeId}`)
      contributors.forEach((contributor) => {
        vm.addContributor({
          contributionType:
            contributor.contribution === 'photographe' ? 'photographers' : 'designers',
          user: vm.allUsers.find((user) => user.id === contributor.idUtilisateur),
        })
      })
    },
    getEdgeUrl(issuenumber, extension) {
      return (
        `${process.env.EDGES_URL}/${this.country}/gen/` +
        `${this.magazine}.${issuenumber}.${extension}`
      )
    },
    hasPhotoUrl(issuenumber) {
      return (this.photoUrls[issuenumber] || []).length
    },
    ...mapMutations([
      'setDimensions',
      'setCountry',
      'setMagazine',
      'addStep',
      'setSteps',
      'addPhotoUrl',
      'addContributor',
    ]),
    ...mapMutations('editingStep', { setEditIssuenumber: 'setIssuenumber' }),
    ...mapActions([
      'setIssuenumbersFromMinMax',
      'loadPublicationIssues',
      'loadSurroundingEdges',
      'loadGalleryItems',
    ]),
    ...mapMutations('user', ['setAllUsers']),
  },
  middleware: 'authenticated',
}
</script>
<style>
#wrapper {
  display: flex;
  flex-direction: column;
  user-select: none;
}
table.edges {
  float: right;
}

table.edges tr td,
table.edges tr th {
  padding: 0;
  text-align: center;
}

table.edges tr td {
  vertical-align: bottom;
}

table.edges tr th {
  vertical-align: top;
  outline: 1px solid grey;
}
</style>
