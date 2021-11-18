<template>
  <b-alert v-if="error" align="center" variant="danger" show>
    {{ error }}
  </b-alert>
  <b-container
    v-else-if="Object.keys(steps).length && Object.keys(dimensions).length"
    id="wrapper"
    fluid
  >
    <b-alert
      v-for="(warning, idx) in warnings"
      :key="`warning-${idx}`"
      align="center"
      dismissible
      variant="warning"
      show
      @dismissed="removeWarning(idx)"
    >
      {{ warning }}
    </b-alert>
    <top-bar
      :dimensions="editingDimensions"
      @overwrite-model="overwriteModel"
      @set-dimensions="overwriteDimensions"
    />
    <position-helper />
    <b-row class="flex-grow-1 pt-2" align-h="end">
      <b-col class="d-flex align-items-end flex-column overflow-auto h-100">
        <table class="edges">
          <tr v-if="showIssueNumbers">
            <th
              v-if="showPreviousEdge && edgesBefore.length"
              class="surrounding-edge"
            >
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <template v-for="issuenumber in issuenumbers">
              <th
                :key="`issuenumber-${issuenumber}`"
                :class="{
                  clickable: true,
                  published: isPublished(issuenumber),
                  pending: isPending(issuenumber),
                }"
                @click.exact="replaceEditIssuenumber(issuenumber)"
                @click.shift="toggleEditIssuenumber(issuenumber)"
                @dblclick="addEditIssuenumbers(issuenumbers)"
              >
                <div v-if="editingIssuenumbers.includes(issuenumber)">
                  <b-icon-pencil />
                </div>
                <div>
                  {{ issuenumber }}
                </div>
              </th>
              <th
                v-if="showEdgePhotos && photoUrls[issuenumber]"
                :key="`photo-icon-${issuenumber}`"
              >
                <b-icon-camera />
              </th>
            </template>
            <th
              v-if="showNextEdge && edgesAfter.length"
              class="surrounding-edge"
            >
              {{ edgesAfter[0].issuenumber }}
            </th>
          </tr>
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              <published-edge
                :issuenumber="edgesBefore[edgesBefore.length - 1].issuenumber"
                @load="showPreviousEdge = true"
                @error="showPreviousEdge = null"
              />
            </td>
            <template v-for="issuenumber in issuenumbers">
              <td :key="`canvas-${issuenumber}`">
                <edge-canvas
                  v-if="dimensions[issuenumber]"
                  :issuenumber="issuenumber"
                  :dimensions="dimensions[issuenumber]"
                  :steps="steps[issuenumber]"
                  :photo-url="photoUrls[issuenumber]"
                  :contributors="contributors[issuenumber] || {}"
                />
              </td>
              <td
                v-if="showEdgePhotos && photoUrls[issuenumber]"
                :key="`photo-${issuenumber}`"
              >
                <img
                  :alt="photoUrls[issuenumber]"
                  :src="getImageUrl('photos', photoUrls[issuenumber])"
                  :class="{ picker: !!colorPickerOption }"
                  :style="{
                    height: `${zoom * dimensions[issuenumber].height}px`,
                  }"
                  crossorigin
                  @click="setColorFromPhoto"
                  @load="showEdgePhotos = true"
                  @error="showEdgePhotos = null"
                />
              </td>
            </template>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge
                :issuenumber="edgesAfter[0].issuenumber"
                @load="showNextEdge = true"
                @error="showNextEdge = null"
              />
            </td>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <model-edit
          :dimensions="editingDimensions"
          :steps="editingSteps"
          :all-step-colors="stepColors"
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
import modelLoadMixin from '@/mixins/modelLoadMixin'
import surroundingEdgeMixin from '@/mixins/surroundingEdgeMixin'
import showEdgePhotosMixin from '@/mixins/showEdgePhotosMixin'
import PositionHelper from '@/components/PositionHelper'

export default {
  name: 'Edit',
  components: {
    PositionHelper,
    TopBar,
    EdgeCanvas,
    PublishedEdge,
    ModelEdit,
    BIconPencil,
    BIconCamera,
  },
  mixins: [
    svgUtilsMixin,
    modelLoadMixin,
    surroundingEdgeMixin,
    showEdgePhotosMixin,
  ],
  middleware: ['authenticated', 'is-editor'],
  data() {
    return {
      error: null,
    }
  },
  async fetch() {
    await this.fetchAllUsers()
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
    editingDimensions() {
      const vm = this
      return this.editingIssuenumbers.reduce(
        (acc, issuenumber) => ({
          ...acc,
          [issuenumber]: vm.dimensions[issuenumber],
        }),
        {}
      )
    },
    editingSteps() {
      const vm = this
      return this.editingIssuenumbers.reduce(
        (acc, issuenumber) => ({
          ...acc,
          [issuenumber]: vm.steps[issuenumber],
        }),
        {}
      )
    },
    stepColors() {
      const vm = this
      const isColorOption = (optionName) =>
        optionName.toLowerCase().includes('color') ||
        ['fill', 'stroke'].includes(optionName)
      return Object.keys(this.steps).reduce(
        (acc, issuenumber) => ({
          ...acc,
          [issuenumber]: vm.steps[issuenumber].map((step) => [
            ...new Set(
              Object.keys(step.options || {})
                .filter(
                  (optionName) =>
                    isColorOption(optionName) &&
                    step.options[optionName] !== 'transparent'
                )
                .reduce(
                  (acc, optionName) => [...acc, step.options[optionName]],
                  []
                )
            ),
          ]),
        }),
        {}
      )
    },
    ...mapState([
      'country',
      'magazine',
      'issuenumbers',
      'edgesBefore',
      'edgesAfter',
      'photoUrls',
      'contributors',
      'warnings',
    ]),
    ...mapState('editingStep', {
      editingIssuenumbers: 'issuenumbers',
      editingStepNumber: 'stepNumber',
    }),
    ...mapState('renders', ['supportedRenders']),
    ...mapState('ui', ['zoom', 'showIssueNumbers', 'colorPickerOption']),
    ...mapState('user', ['allUsers']),
    ...mapState('edgeCatalog', ['currentEdges', 'publishedEdges']),
  },
  watch: {
    async issuenumbers(newValue) {
      if (newValue) {
        await this.loadItems({ itemType: 'elements' })
        await this.loadItems({ itemType: 'photos' })
        await this.loadSurroundingEdges()
      }
    },
    error(newValue) {
      if (newValue) {
        console.trace(newValue)
      }
    },
  },
  async mounted() {
    const vm = this
    let country, magazine, issuenumberMin, issuenumberMax, issuenumberOthers
    try {
      ;[
        ,
        country,
        magazine,
        issuenumberMin,
        issuenumberMax,
        issuenumberOthers,
      ] = vm.$route.params.pathMatch.match(
        /^([^/]+)\/([^ ]+) ([^, ]+)(?: to (.+))?(?:,([^$]+))?$/
      )
      magazine = magazine.replaceAll(/ +/g, '')
    } catch (_) {
      this.error = 'Invalid URL'
      return
    }
    this.setCountry(country)
    this.setMagazine(magazine)
    this.addEditIssuenumber(issuenumberMin)

    await this.loadPublicationIssues()

    try {
      this.setIssuenumbers({
        min: issuenumberMin,
        max: issuenumberMax,
        others: issuenumberOthers,
      })

      for (let idx = 0; idx < vm.issuenumbers.length; idx++) {
        if (!Object.prototype.hasOwnProperty.call(vm.issuenumbers, idx)) {
          continue
        }
        const issuenumber = vm.issuenumbers[idx]
        try {
          await vm.loadModel(country, magazine, issuenumber, issuenumber)
        } catch {
          if (vm.issuenumbers[idx - 1]) {
            vm.copyDimensionsAndSteps(issuenumber, vm.issuenumbers[idx - 1])
          } else {
            vm.setDimensions({ width: 15, height: 200 }, issuenumber)
            vm.setSteps(issuenumber, [])
          }
        }
      }
    } catch (e) {
      this.error = e
    }
  },
  methods: {
    async overwriteModel({ publicationCode, issueNumber }) {
      for (const targetIssuenumber of this.editingIssuenumbers) {
        try {
          await this.loadModel(
            ...publicationCode.split('/'),
            issueNumber,
            targetIssuenumber
          )
        } catch (e) {
          this.addWarning(e)
        }
      }
    },
    overwriteDimensions({ width, height }) {
      for (const targetIssuenumber of this.editingIssuenumbers) {
        this.setDimensions(
          {
            width,
            height,
          },
          targetIssuenumber
        )
      }
    },
    getImageUrl(fileType, fileName) {
      return `/edges/${this.country}/${
        fileType === 'elements' ? fileType : 'photos'
      }/${fileName}`
    },
    setColorFromPhoto({ target: imgElement, offsetX, offsetY }) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = imgElement.width
      canvas.height = imgElement.height
      context.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height)
      const color = context.getImageData(offsetX, offsetY, 1, 1).data
      this.$root.$emit('set-options', {
        [this.colorPickerOption]: this.rgbToHex(...color),
      })
    },
    isPending(issuenumber) {
      return !!this.currentEdges[
        `${this.country}/${this.magazine} ${issuenumber}`
      ]
    },
    isPublished(issuenumber) {
      return !!(this.publishedEdges[`${this.country}/${this.magazine}`] || {})[
        issuenumber
      ]
    },
    rgbToHex: (r, g, b) => `#${((r << 16) | (g << 8) | b).toString(16)}`,
    ...mapMutations([
      'setCountry',
      'setMagazine',
      'setPhotoUrl',
      'addContributor',
      'addWarning',
      'removeWarning',
    ]),
    ...mapMutations('editingStep', {
      toggleEditIssuenumber: 'toggleIssuenumber',
      replaceEditIssuenumber: 'replaceIssuenumber',
      addEditIssuenumber: 'addIssuenumber',
      addEditIssuenumbers: 'addIssuenumbers',
    }),
    ...mapActions([
      'setIssuenumbers',
      'loadPublicationIssues',
      'loadSurroundingEdges',
      'loadItems',
    ]),
    ...mapMutations('user', ['setAllUsers']),
    ...mapActions('user', ['fetchAllUsers']),
  },
}
</script>
<style lang="scss" scoped>
#wrapper {
  display: flex;
  flex-direction: column;
  user-select: none;
}

.alert-warning {
  margin-left: 350px;
  margin-right: 150px;
}

.picker {
  cursor: crosshair;
}

.clickable {
  cursor: pointer;
}

table.edges {
  margin-left: auto !important; /* https://stackoverflow.com/a/37515194/2847079 */
  tr {
    > * {
      text-align: center;
      vertical-align: bottom;
    }
    td {
      padding: 0;
    }
    th {
      padding: 1px 2px;

      &.published {
        background: green;
      }

      &.pending {
        background: orange;
      }

      &.surrounding-edge {
        font-weight: normal;
      }
    }
  }
}
</style>
