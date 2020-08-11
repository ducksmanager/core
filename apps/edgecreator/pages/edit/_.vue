<template>
  <b-container v-if="error" id="wrapper" fluid>
    {{ error }}
  </b-container>
  <b-container v-else-if="Object.keys(steps).length && width && height" id="wrapper" fluid>
    <top-bar />
    <b-row class="flex-grow-1 pt-2" align-h="end">
      <b-col class="text-right">
        <table class="edges">
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              <published-edge :issuenumber="edgesBefore[edgesBefore.length - 1].issuenumber" />
            </td>
            <template v-for="(issueSteps, issuenumber) in steps">
              <td :key="issuenumber">
                <edge-canvas
                  :issuenumber="issuenumber"
                  :width="width"
                  :height="height"
                  :steps="issueSteps"
                  :photo-url="photoUrls[issuenumber]"
                  :contributors="contributors"
                />
              </td>
              <td v-if="showEdgePhotos && photoUrls[issuenumber]" :key="issuenumber">
                <img
                  :src="getImageUrl('photos', photoUrls[issuenumber])"
                  :class="{ picker: !!colorPickerOption }"
                  :style="{ height: `${zoom * height}px` }"
                  @click="setColorFromPhoto"
                />
              </td>
            </template>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge :issuenumber="edgesAfter[0].issuenumber" />
            </td>
          </tr>
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length" class="surrounding-edge">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <template v-for="issuenumber in issuenumbers">
              <th :key="issuenumber">
                <div
                  :class="{ clickable: editingIssuenumber !== issuenumber && !locked }"
                  @click="setEditIssuenumber(issuenumber)"
                >
                  {{ issuenumber }}
                </div>
                <span v-if="editingIssuenumber === issuenumber || locked"><b-icon-pencil /></span>
              </th>
              <th v-if="showEdgePhotos && photoUrls[issuenumber]" :key="issuenumber">
                <b-icon-camera />
              </th>
            </template>
            <th v-if="showNextEdge && edgesAfter.length" class="surrounding-edge">
              {{ edgesAfter[0].issuenumber }}
            </th>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <model-edit
          :steps="steps[editingIssuenumber]"
          @add-step="addStep($event)"
          @remove-step="removeStep($event)"
          @duplicate-step="duplicateStep($event)"
          @swap-steps="swapSteps($event)"
        />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import Vue from 'vue'
import { mapActions, mapMutations, mapState } from 'vuex'

import { BIconCamera, BIconPencil } from 'bootstrap-vue'
import TopBar from '@/components/TopBar'
import EdgeCanvas from '@/components/EdgeCanvas'
import PublishedEdge from '@/components/PublishedEdge'
import ModelEdit from '@/components/ModelEdit'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'
import legacyDbMixin from '@/mixins/legacyDbMixin'

export default {
  components: {
    TopBar,
    EdgeCanvas,
    PublishedEdge,
    ModelEdit,
    BIconPencil,
    BIconCamera,
  },
  mixins: [svgUtilsMixin, legacyDbMixin],
  async fetch() {
    this.setAllUsers((await this.$axios.$get(`/api/ducksmanager/users`)).users)
  },
  data() {
    return {
      error: null,
      steps: {},
    }
  },
  computed: {
    zoom: {
      get() {
        return this.$store.state.ui.zoom
      },
      set(value) {
        this.$store.commit('ui/setZoom', value)
      },
    },
    ...mapState([
      'width',
      'height',
      'country',
      'magazine',
      'issuenumbers',
      'edgesBefore',
      'edgesAfter',
      'photoUrls',
      'contributors',
    ]),
    ...mapState('editingStep', { editingIssuenumber: 'issuenumber' }),
    ...mapState('renders', ['supportedRenders']),
    ...mapState('ui', [
      'zoom',
      'locked',
      'showIssueNumbers',
      'showPreviousEdge',
      'showNextEdge',
      'showEdgePhotos',
      'colorPickerOption',
    ]),
    ...mapState('user', ['allUsers']),
  },
  watch: {
    async issuenumbers(newValue) {
      if (newValue) {
        await this.loadItems({ itemType: 'elements' })
        await this.loadItems({ itemType: 'photos' })
        await this.loadSurroundingEdges()
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

    for (let idx = 0; idx < vm.issuenumbers.length; idx++) {
      if (!Object.prototype.hasOwnProperty.call(vm.issuenumbers, idx)) {
        continue
      }
      const issuenumber = vm.issuenumbers[idx]
      try {
        await this.loadSvg(this.country, this.magazine, issuenumber)
      } catch {
        const edge = await this.$axios.$get(
          `/api/edgecreator/v2/model/${country}/${magazine}/${issuenumber}`
        )
        if (edge) {
          const steps = (await vm.$axios.$get(`/api/edgecreator/v2/model/${edge.id}/steps`)) || []

          await vm.setPhotoUrlsFromApi(issuenumber, edge.id)
          await vm.setContributorsFromApi(edge.id)

          vm.setDimensionsFromApi(steps)
          vm.setStepsFromApi(issuenumber, steps)
        } else {
          try {
            await this.loadSvg(this.country, this.magazine, issuenumber, true)
          } catch {
            Vue.set(vm.steps, issuenumber, { ...vm.steps[vm.issuenumbers[idx - 1]] })
          }
        }
      }
    }
  },
  methods: {
    getImageUrl(fileType, fileName) {
      return `${process.env.EDGES_URL}/${this.country}/${
        fileType === 'elements' ? fileType : 'photos'
      }/${fileName}`
    },
    addStep(component) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        Vue.set(vm.steps[issuenumber], vm.steps[issuenumber].length, { component })
      })
    },
    removeStep(stepNumber) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        vm.steps[issuenumber].splice(stepNumber, 1)
      })
    },
    duplicateStep(stepNumber) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        const existingStep = vm.steps[issuenumber][stepNumber]
        vm.steps[issuenumber].splice(stepNumber, 0, {
          component: existingStep.component,
          options: { ...existingStep.options },
        })
      })
    },
    swapSteps(stepNumbers) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        const steps = vm.steps[issuenumber]
        const stepsToSwap = [steps[stepNumbers[0]], steps[stepNumbers[1]]]
        vm.steps[issuenumber].splice(stepNumbers[0], 2, stepsToSwap[1], stepsToSwap[0])
      })
    },
    async loadSvg(country, magazine, issuenumber, publishedVersion = false) {
      const { svgElement, svgChildNodes } = await this.loadSvgFromString(
        country,
        magazine,
        issuenumber,
        publishedVersion
      )

      this.setDimensionsFromSvg(svgElement)
      this.setStepsFromSvg(issuenumber, svgChildNodes)
      this.setPhotoUrlsFromSvg(issuenumber, svgChildNodes)
      this.setContributorsFromSvg(svgChildNodes)
    },
    setDimensionsFromSvg(svgElement) {
      this.setDimensions({
        width: svgElement.getAttribute('width') / 1.5,
        height: svgElement.getAttribute('height') / 1.5,
      })
    },
    setStepsFromSvg(issuenumber, svgChildNodes) {
      Vue.set(
        this.steps,
        issuenumber,
        svgChildNodes
          .filter((node) => node.nodeName === 'g')
          .map((group) => ({
            component: group.getAttribute('class'),
            options: JSON.parse(group.getElementsByTagName('metadata')[0].textContent),
          }))
      )
    },
    setPhotoUrlsFromSvg(issuenumber, svgChildNodes) {
      const vm = this
      vm.getSvgMetadata(svgChildNodes, 'photo').forEach((photoUrl) => {
        vm.setPhotoUrl({ issuenumber, filename: photoUrl })
      })
    },
    setContributorsFromSvg(svgChildNodes) {
      const vm = this
      const contributionTypes = ['photographer', 'designer']
      contributionTypes.forEach((contributionType) => {
        vm.getSvgMetadata(svgChildNodes, `contributor-${contributionType}`).forEach((username) => {
          vm.addContributor({ contributionType: `${contributionType}s`, user: { username } })
        })
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
    setStepsFromApi(issuenumber, stepData) {
      const vm = this
      Vue.set(
        this.steps,
        issuenumber,
        stepData
          .filter((step) => step.ordre !== -1)
          .map(async (step) => {
            const component = vm.supportedRenders.find(
              (component) => component.originalName === step.nomFonction
            )
            return {
              component,
              options: await vm.getOptionsFromDb(component, step.options),
            }
          })
      )
    },
    async setPhotoUrlsFromApi(issuenumber, edgeId) {
      const photo = await this.$axios.$get(`/api/edgecreator/model/v2/${edgeId}/photo/main`)
      if (photo) {
        this.setPhotoUrl({ issuenumber, filename: photo.nomfichier })
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
    setColorFromPhoto({ target: imgElement, offsetX, offsetY }) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = imgElement.width
      canvas.height = imgElement.height
      context.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height)
      const color = context.getImageData(offsetX, offsetY, 1, 1).data
      this.$root.$emit('set-option', this.colorPickerOption, this.rgbToHex(...color))
    },
    rgbToHex: (r, g, b) => '#' + ((r << 16) | (g << 8) | b).toString(16),
    ...mapMutations([
      'setDimensions',
      'setCountry',
      'setMagazine',
      'setSteps',
      'setPhotoUrl',
      'addContributor',
    ]),
    ...mapMutations('editingStep', { setEditIssuenumber: 'setIssuenumber' }),
    ...mapActions([
      'setIssuenumbersFromMinMax',
      'loadPublicationIssues',
      'loadSurroundingEdges',
      'loadItems',
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
.picker {
  cursor: crosshair;
}
.clickable {
  cursor: pointer;
}

table.edges {
  float: right;
}

table.edges tr td,
table.edges tr th {
  padding: 1px 2px;
  text-align: center;
}

table.edges tr td {
  vertical-align: bottom;
}

table.edges tr th {
  vertical-align: top;
  outline: 1px solid grey;
}

table.edges tr th.surrounding-edge {
  font-weight: normal;
}
</style>
