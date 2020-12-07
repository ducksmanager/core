<template>
  <b-alert v-if="error" align="center" variant="danger" show>
    {{ error }}
  </b-alert>
  <b-container v-else-if="Object.keys(steps).length && width && height" id="wrapper" fluid>
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
    <top-bar @overwrite-model="overwriteModel($event)" />
    <b-row class="flex-grow-1 pt-2" align-h="end">
      <b-col class="text-right">
        <table class="edges">
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length" class="surrounding-edge">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <template v-for="issuenumber in issuenumbers">
              <th :key="`issuenumber-${issuenumber}`">
                <span v-if="editingIssuenumber === issuenumber || locked"><b-icon-pencil /></span>
                <div
                  :class="{ clickable: editingIssuenumber !== issuenumber && !locked }"
                  @click="setEditIssuenumber(issuenumber)"
                >
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
            <th v-if="showNextEdge && edgesAfter.length" class="surrounding-edge">
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
            <template v-for="(issueSteps, issuenumber) in steps">
              <td :key="`canvas-${issuenumber}`">
                <edge-canvas
                  :issuenumber="issuenumber"
                  :width="width"
                  :height="height"
                  :steps="issueSteps"
                  :photo-url="photoUrls[issuenumber]"
                  :contributors="contributors[issuenumber] || {}"
                />
              </td>
              <td v-if="showEdgePhotos && photoUrls[issuenumber]" :key="`photo-${issuenumber}`">
                <img
                  :alt="photoUrls[issuenumber]"
                  :src="getImageUrl('photos', photoUrls[issuenumber])"
                  :class="{ picker: !!colorPickerOption }"
                  :style="{ height: `${zoom * height}px` }"
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
import stepListMixin from '@/mixins/stepListMixin'
import modelLoadMixin from '@/mixins/modelLoadMixin'
import surroundingEdgeMixin from '@/mixins/surroundingEdgeMixin'
import showEdgePhotosMixin from '@/mixins/showEdgePhotosMixin'

export default {
  components: {
    TopBar,
    EdgeCanvas,
    PublishedEdge,
    ModelEdit,
    BIconPencil,
    BIconCamera,
  },
  mixins: [svgUtilsMixin, stepListMixin, modelLoadMixin, surroundingEdgeMixin, showEdgePhotosMixin],
  middleware: 'authenticated',
  data() {
    return {
      error: null,
    }
  },
  async fetch() {
    this.setAllUsers((await this.$axios.$get(`/api/ducksmanager/users`)).users)
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
      'warnings',
    ]),
    ...mapState('editingStep', {
      editingIssuenumber: 'issuenumber',
      editingStepNumber: 'stepNumber',
    }),
    ...mapState('renders', ['supportedRenders']),
    ...mapState('ui', ['zoom', 'locked', 'showIssueNumbers', 'colorPickerOption']),
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
          await vm.loadModel(country, magazine, issuenumber, issuenumber)
        } catch {
          if (vm.issuenumbers[idx - 1]) {
            vm.copySteps(issuenumber, vm.issuenumbers[idx - 1])
          } else {
            vm.setSteps(issuenumber, [])
          }
        }
      }
    } catch (e) {
      vm.error = e
    }
  },
  methods: {
    async overwriteModel({ publicationCode, issueNumber, targetIssuenumber }) {
      await this.loadModel(...publicationCode.split('/'), issueNumber, targetIssuenumber)
    },
    getImageUrl(fileType, fileName) {
      return `${process.env.EDGES_URL}/${this.country}/${
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
      this.$root.$emit('set-options', { [this.colorPickerOption]: this.rgbToHex(...color) })
    },
    rgbToHex: (r, g, b) => `#${((r << 16) | (g << 8) | b).toString(16)}`,
    ...mapMutations([
      'setDimensions',
      'setCountry',
      'setMagazine',
      'setPhotoUrl',
      'addContributor',
      'removeWarning',
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
