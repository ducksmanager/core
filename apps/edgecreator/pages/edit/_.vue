<template>
  <b-alert v-if="error" align="center" variant="danger" show>
    {{ error }}
  </b-alert>
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
                  :contributors="contributors[issuenumber] || {}"
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
import { mapActions, mapMutations, mapState } from 'vuex'

import { BIconCamera, BIconPencil } from 'bootstrap-vue'
import TopBar from '@/components/TopBar'
import EdgeCanvas from '@/components/EdgeCanvas'
import PublishedEdge from '@/components/PublishedEdge'
import ModelEdit from '@/components/ModelEdit'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'
import legacyDbMixin from '@/mixins/legacyDbMixin'
import stepListMixin from '@/mixins/stepListMixin'

export default {
  components: {
    TopBar,
    EdgeCanvas,
    PublishedEdge,
    ModelEdit,
    BIconPencil,
    BIconCamera,
  },
  mixins: [svgUtilsMixin, legacyDbMixin, stepListMixin],
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
    ...mapState('editingStep', {
      editingIssuenumber: 'issuenumber',
      editingStepNumber: 'stepNumber',
    }),
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

    try {
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
            await vm.setStepsFromApi(issuenumber, steps)

            await vm.setPhotoUrlsFromApi(issuenumber, edge.id)
            await vm.setContributorsFromApi(issuenumber, edge.id)

            vm.setDimensionsFromApi(steps)
          } else {
            try {
              await this.loadSvg(this.country, this.magazine, issuenumber, true)
            } catch {
              vm.copySteps(issuenumber, vm.issuenumbers[idx - 1])
            }
          }
        }
      }
    } catch (e) {
      vm.error = e
    }
  },
  methods: {
    getImageUrl(fileType, fileName) {
      return `${process.env.EDGES_URL}/${this.country}/${
        fileType === 'elements' ? fileType : 'photos'
      }/${fileName}`
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
      this.setContributorsFromSvg(issuenumber, svgChildNodes)
    },
    setDimensionsFromSvg(svgElement) {
      this.setDimensions({
        width: svgElement.getAttribute('width') / 1.5,
        height: svgElement.getAttribute('height') / 1.5,
      })
    },
    setStepsFromSvg(issuenumber, svgChildNodes) {
      this.setSteps(
        issuenumber,
        svgChildNodes
          .filter(({ nodeName }) => nodeName === 'g')
          .map((group) => ({
            component: group.getAttribute('class'),
            options: JSON.parse(
              (group.getElementsByTagName('metadata')[0] || { textContent: '{}' }).textContent
            ),
          }))
      )
    },
    setPhotoUrlsFromSvg(issuenumber, svgChildNodes) {
      const vm = this
      vm.getSvgMetadata(svgChildNodes, 'photo').forEach((photoUrl) => {
        vm.setPhotoUrl({ issuenumber, filename: photoUrl })
      })
    },
    setContributorsFromSvg(issuenumber, svgChildNodes) {
      const vm = this
      const contributionTypes = ['photographer', 'designer']
      contributionTypes.forEach((contributionType) => {
        vm.getSvgMetadata(svgChildNodes, `contributor-${contributionType}`).forEach((username) => {
          vm.addContributor({
            issuenumber,
            contributionType: `${contributionType}s`,
            user: { username },
          })
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
    async setStepsFromApi(issuenumber, stepData) {
      const vm = this
      this.setSteps(
        issuenumber,
        await Promise.all(
          stepData
            .filter((step) => step.ordre !== -1)
            .map(async (step) => {
              const { component } = vm.supportedRenders.find(
                (component) => component.originalName === step.nomFonction
              )
              const options = await vm.getOptionsFromDb(component, step.options)
              return Promise.resolve({
                component,
                options,
              })
            })
        )
      )
    },
    async setPhotoUrlsFromApi(issuenumber, edgeId) {
      const photo = await this.$axios.$get(`/api/edgecreator/model/v2/${edgeId}/photo/main`)
      if (photo) {
        this.setPhotoUrl({ issuenumber, filename: photo.nomfichier })
      }
    },
    async setContributorsFromApi(issuenumber, edgeId) {
      const vm = this
      const contributors = await vm.$axios.$get(`/api/edgecreator/contributors/${edgeId}`)
      contributors.forEach(({ contribution, idUtilisateur }) => {
        vm.addContributor({
          issuenumber,
          contributionType: contribution === 'photographe' ? 'photographers' : 'designers',
          user: vm.allUsers.find((user) => user.id === idUtilisateur),
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
      this.$root.$emit('set-options', { [this.colorPickerOption]: this.rgbToHex(...color) })
    },
    rgbToHex: (r, g, b) => '#' + ((r << 16) | (g << 8) | b).toString(16),
    ...mapMutations([
      'setDimensions',
      'setCountry',
      'setMagazine',
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
  text-align: center;
}

table.edges tr td {
  padding: 0;
  vertical-align: bottom;
}

table.edges tr th {
  vertical-align: top;
  padding: 1px 2px;
  outline: 1px solid grey;
}

table.edges tr th.surrounding-edge {
  font-weight: normal;
}
</style>
