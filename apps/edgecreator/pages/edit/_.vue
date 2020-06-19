<template>
  <b-container v-if="error" id="wrapper" fluid>
    {{ error }}
  </b-container>
  <b-container v-else-if="steps.length" id="wrapper" fluid>
    <b-row align="center" class="pt-2">
      <b-col class="text-left">
        <b-button v-b-toggle.sidebar>Toggle Options</b-button>
        <b-sidebar id="sidebar" v-model="showSidebar" title="Options" shadow>
          <b-container class="px-3 py-2">
            <b-row align-items="center">
              <b-col cols="6">
                Zoom
              </b-col>
              <b-col cols="2">{{ zoom }} </b-col>
              <b-col cols="4">
                <input
                  v-model="zoom"
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  style="width: 100%"
              /></b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showIssueNumbers">Show issue numbers</label></b-col
              >
              <b-col>
                <b-checkbox
                  id="showIssueNumbers"
                  v-model="showIssueNumbers"
                  :disabled="!loaded"
              /></b-col>
            </b-row>
            <b-row>
              <b-col
                ><label for="showPreviousEdge">Show previous edge</label></b-col
              >
              <b-col>
                <b-checkbox
                  id="showPreviousEdge"
                  v-model="showPreviousEdge"
                  :disabled="!edgesBefore.length"
              /></b-col>
            </b-row>
            <b-row>
              <b-col><label for="showNextEdge">Show next edge</label></b-col>
              <b-col>
                <b-checkbox
                  id="showNextEdge"
                  v-model="showNextEdge"
                  :disabled="!edgesAfter.length"
              /></b-col> </b-row
          ></b-container>
        </b-sidebar>
      </b-col>
      <b-col align-self="center" class="col-sm-4">
        <b-button to="/">Home</b-button>
        <b-button :disabled="!loaded" @click="exportSvg">Export</b-button>
      </b-col>
      <b-col />
    </b-row>
    <b-row align="center" class="p-2" style="border-bottom: 1px solid grey">
      <b-col align-self="center">
        <img :src="flagImageUrl" :alt="country" />&nbsp;{{ magazine }}&nbsp;{{
          issuenumberMin
        }}<span v-if="issuenumberMin !== issuenumberMax">
          to {{ issuenumberMax }}</span
        >
      </b-col>
    </b-row>
    <b-row v-if="loaded" class="flex-grow-1 pt-2">
      <b-col class="text-right">
        <table class="edges">
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              <published-edge
                :issuenumber="edgesBefore[edgesBefore.length - 1].issuenumber"
              />
            </td>
            <td v-for="issuenumber in issuenumbers" :key="issuenumber">
              <edge-canvas
                :ref="getEdgeCanvasRefId(issuenumber)"
                :issuenumber="issuenumber"
                :steps="steps"
              />
            </td>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge :issuenumber="edgesAfter[0].issuenumber" />
            </td>
          </tr>
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <th v-for="issuenumber in issuenumbers" :key="issuenumber">
              {{ issuenumber }}<br />&#11088;
            </th>
            <th v-if="showNextEdge && edgesAfter.length">
              {{ edgesAfter[0].issuenumber }}
            </th>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <ModelEdit :steps="steps" />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import EdgeCanvas from '~/components/EdgeCanvas'
import PublishedEdge from '~/components/PublishedEdge'

import ModelEdit from '~/components/ModelEdit'

const DOMParser = require('xmldom').DOMParser

export default {
  components: {
    EdgeCanvas,
    PublishedEdge,
    ModelEdit
  },
  data() {
    return {
      error: null,
      loaded: false,
      issuenumberMin: null,
      issuenumberMax: null,
      steps: [],
      showSidebar: true,
      showIssueNumbers: true,
      showPreviousEdge: true,
      showNextEdge: true
    }
  },
  computed: {
    zoom: {
      get() {
        return this.$store.state.zoom
      },
      set(value) {
        this.$store.commit('setZoom', value)
      }
    },
    flagImageUrl() {
      return `${process.env.DM_URL}/images/flags/${this.country}.png`
    },
    ...mapState([
      'country',
      'magazine',
      'issuenumbers',
      'edgesBefore',
      'edgesAfter'
    ]),
    ...mapState('renders', ['supportedRenders'])
  },
  watch: {
    issuenumberMin(newValue) {
      this.setEditIssuenumber(newValue)
    },
    steps(newValue) {
      if (newValue) {
        this.loadGalleryItems()
        this.loadSurroundingEdges()
      }
    }
  },
  async mounted() {
    const vm = this
    const [
      country,
      magazine,
      issuenumberMin,
      ,
      issuenumberMax
    ] = vm.$route.params.pathMatch.split('/')
    if ([country, magazine, issuenumberMin].includes(undefined)) {
      this.error = 'Invalid URL'
      return
    }
    this.setCountry(country)
    this.setMagazine(magazine)

    this.issuenumberMin = issuenumberMin
    if (issuenumberMax === undefined) {
      this.issuenumberMax = null
      this.setIssuenumbers([issuenumberMin])
    } else {
      this.setIssuenumbers([issuenumberMin, issuenumberMax])
    }

    await this.$axios
      .$get(this.getEdgeUrl(issuenumberMin, 'svg'))
      .then((data) => {
        const doc = new DOMParser().parseFromString(data, 'image/svg+xml')
        const svgElement = doc.getElementsByTagName('svg')[0]
        vm.setDimensions({
          width: svgElement.getAttribute('width') / 1.5,
          height: svgElement.getAttribute('height') / 1.5
        })

        vm.loaded = true
        vm.steps = Object.values(svgElement.childNodes)
          .filter((group) => group.nodeName === 'g')
          .map((group) => ({
            component: group.getAttribute('class'),
            svgGroupElement: group
          }))
      })
      .catch(async () => {
        const edge = await this.$axios.$get(
          `/api/edgecreator/v2/model/${country}/${magazine}/${issuenumberMin}`
        )
        if (!edge) {
          vm.loaded = true
          return
        }
        vm.$axios
          .$get(`/api/edgecreator/v2/model/${edge.id}/steps`)
          .then((steps) => {
            vm.loaded = true
            const dimensions = steps.find((step) => step.ordre === -1)
            if (dimensions) {
              vm.setDimensions({
                width: dimensions.options.Dimension_x,
                height: dimensions.options.Dimension_y
              })
            }

            vm.steps = steps
              .filter((step) => step.ordre !== -1)
              .map((step) => ({
                component: vm.supportedRenders.find(
                  (component) => component.originalName === step.nomFonction
                ).component,
                dbOptions: step.options
              }))
          })
      })
  },
  methods: {
    getEdgeUrl(issuenumber, extension = 'png') {
      return `${process.env.EDGES_URL}/${this.country}/gen/${this.magazine}.${issuenumber}.${extension}`
    },
    getEdgeCanvasRefId(issuenumber) {
      return `edge-canvas-${issuenumber}`
    },
    exportSvg() {
      const vm = this
      this.zoom = 1.5
      vm.$nextTick().then(() => {
        vm.issuenumbers.forEach((issuenumber) => {
          vm.$axios
            .$put('/fs/export', {
              country: vm.country,
              magazine: vm.magazine,
              issuenumber,
              content:
                vm.$refs[vm.getEdgeCanvasRefId(issuenumber)][0].$refs.edge
                  .outerHTML
            })
            .then(() => {
              vm.$bvToast.toast('Export done', {
                toaster: 'b-toaster-top-center'
              })
            })
        })
      })
    },
    ...mapMutations([
      'setDimensions',
      'setCountry',
      'setMagazine',
      'setIssuenumbers'
    ]),
    ...mapMutations('editingStep', { setEditIssuenumber: 'setIssuenumber' }),
    ...mapActions(['loadSurroundingEdges', 'loadGalleryItems'])
  }
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
