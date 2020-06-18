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
          issuenumber
        }}
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
            <td>
              <edge-canvas :hovered-step="hoveredStep" />
            </td>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge :issuenumber="edgesAfter[0].issuenumber" />
            </td>
          </tr>
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <th>{{ issuenumber }}<br />&#11088;</th>
            <th v-if="showNextEdge && edgesAfter.length">
              {{ edgesAfter[0].issuenumber }}
            </th>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <ModelEdit
          :hovered-step="hoveredStep"
          @hover-step="hoveredStep = $event"
        />
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
      hoveredStep: null,
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
      'steps',
      'country',
      'magazine',
      'issuenumber',
      'edgesBefore',
      'edgesAfter'
    ]),
    ...mapState('renders', ['supportedRenders'])
  },
  watch: {
    steps(newValue) {
      if (newValue) {
        this.loadGalleryItems()
        this.loadSurroundingEdges()
      }
    }
  },
  async mounted() {
    const vm = this
    const [country, magazine, issuenumber] = vm.$route.params.pathMatch.split(
      '/'
    )
    if ([country, magazine, issuenumber].includes(undefined)) {
      this.error = 'Invalid URL'
      return
    }
    this.setCountry(country)
    this.setMagazine(magazine)
    this.setIssuenumber(issuenumber)

    await this.$axios
      .$get(this.getEdgeUrl(vm.issuenumber, 'svg'))
      .then((data) => {
        const doc = new DOMParser().parseFromString(data, 'image/svg+xml')
        const svgElement = doc.getElementsByTagName('svg')[0]
        vm.setDimensions({
          width: svgElement.getAttribute('width') / 1.5,
          height: svgElement.getAttribute('height') / 1.5
        })

        vm.loaded = true
        vm.setSteps(
          Object.values(svgElement.childNodes)
            .filter((group) => group.nodeName === 'g')
            .map((group) => ({
              component: group.getAttribute('class'),
              svgGroupElement: group
            }))
        )
      })
      .catch(async () => {
        const edge = await this.$axios.$get(
          `/api/edgecreator/v2/model/${country}/${magazine}/${issuenumber}`
        )
        if (!edge) {
          vm.loaded = true
          return
        }
        vm.$axios
          .$get(`/api/edgecreator/v2/model/${vm.edge.id}/steps`)
          .then((steps) => {
            vm.loaded = true
            const dimensions = steps.find((step) => step.ordre === -1)
            if (dimensions) {
              vm.setDimensions({
                width: dimensions.options.Dimension_x,
                height: dimensions.options.Dimension_y
              })
            }

            vm.setSteps(
              steps
                .filter((step) => step.ordre !== -1)
                .map((step) => ({
                  component: vm.supportedRenders.find(
                    (component) => component.originalName === step.nomFonction
                  ).component,
                  dbOptions: step.options
                }))
            )
          })
      })
  },
  methods: {
    getEdgeUrl(issuenumber, extension = 'png') {
      return `${process.env.EDGES_URL}/${this.country}/gen/${this.magazine}.${issuenumber}.${extension}`
    },
    exportSvg() {
      const vm = this
      this.zoom = 1.5
      vm.$nextTick().then(() => {
        vm.$axios
          .$put('/fs/export', {
            country: vm.country,
            magazine: vm.magazine,
            issuenumber: vm.issuenumber,
            content: vm.$refs.edge.outerHTML
          })
          .then(() => {
            vm.$bvToast.toast('Export done', {
              toaster: 'b-toaster-top-center'
            })
          })
      })
    },
    ...mapMutations([
      'setSteps',
      'setDimensions',
      'setCountry',
      'setMagazine',
      'setIssuenumber',
      'setIssuenumberMax'
    ]),
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

svg g:hover,
svg g.hovered {
  animation: glowFilter 2s infinite;
}

@keyframes glowFilter {
  0% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px black);
    filter: drop-shadow(-0.75px 0px 6px black);
    stroke: black;
  }
  25% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px grey);
    filter: drop-shadow(-0.75px 0px 6px grey);
    stroke: grey;
  }
  50% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px white);
    filter: drop-shadow(-0.75px 0px 6px white);
    stroke: white;
  }
  75% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px grey);
    filter: drop-shadow(-0.75px 0px 6px grey);
    stroke: grey;
  }
  100% {
    -webkit-filter: drop-shadow(-0.75px 0px 6px black);
    filter: drop-shadow(-0.75px 0px 6px black);
    stroke: black;
  }
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
