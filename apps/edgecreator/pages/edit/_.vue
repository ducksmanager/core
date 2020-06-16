<template>
  <b-container v-if="error" id="wrapper" fluid>
    {{ error }}
  </b-container>
  <b-container v-else-if="edge" id="wrapper" fluid>
    <b-row align="center">
      <b-col class="text-left col-sm-4">
        <div>
          <label style="display: inline-block;width: 200px"
            >Zoom : {{ zoom }}
            <input v-model="zoom" type="range" min="1" max="8" step="0.5" />
          </label>
        </div>
      </b-col>
      <b-col align-self="center" class="col-sm-4">
        <b-button to="/">Home</b-button>
        <b-button :disabled="!loaded" @click="exportSvg">Export</b-button>
      </b-col>
      <b-col align-self="center" class="text-right col-sm-2">
        <b-form-checkbox
          v-model="showIssueNumbers"
          :disabled="!edgesBefore.length && !edgesAfter.length"
          >Show issue numbers</b-form-checkbox
        >
      </b-col>
      <b-col class="text-right col-sm-2">
        <b-form-checkbox
          v-model="showPreviousEdge"
          :disabled="!edgesBefore.length"
          >Show previous edge</b-form-checkbox
        >
        <b-form-checkbox v-model="showNextEdge" :disabled="!edgesAfter.length"
          >Show next edge</b-form-checkbox
        >
      </b-col>
    </b-row>
    <b-row v-if="loaded" class="flex-grow-1">
      <b-col class="text-right">
        <table class="edges">
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              <published-edge
                :issuenumber="edgesBefore[edgesBefore.length - 1].issuenumber"
              />
            </td>
            <td>
              <svg
                ref="edge"
                :viewBox="`0 0 ${width} ${height}`"
                :width="zoom * width"
                :height="zoom * height"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                preserveAspectRatio="none"
              >
                <g
                  v-for="(step, stepNumber) in steps"
                  :key="stepNumber"
                  :class="{
                    [step.component]: true,
                    hovered: hoveredStep === stepNumber
                  }"
                  @mousedown="setStepNumber(stepNumber)"
                >
                  <component
                    :is="`${step.component}Render`"
                    v-if="$options.components[`${step.component}Render`]"
                    :step-number="stepNumber"
                    :svg-group="step.svgGroupElement"
                    :db-options="step.dbOptions"
                  ></component>
                </g>
                <rect
                  id="border"
                  :x="borderWidth / 2"
                  :y="borderWidth / 2"
                  :width="width - borderWidth"
                  :height="height - borderWidth"
                  fill="none"
                  stroke="black"
                  :stroke-width="borderWidth"
                />
              </svg>
            </td>
            <td v-if="showNextEdge && edgesAfter.length">
              <published-edge :issuenumber="edgesAfter[0].issuenumber" />
            </td>
          </tr>
          <tr v-if="showIssueNumbers">
            <th v-if="showPreviousEdge && edgesBefore.length">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </th>
            <th>{{ edge.issuenumber }}<br />&#11088;</th>
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
import Gallery from '~/components/Gallery'
import FormInputRow from '~/components/FormInputRow'
import FormColorInputRow from '~/components/FormColorInputRow'
import PublishedEdge from '~/components/PublishedEdge'

import ModelEdit from '~/components/ModelEdit'
import RectangleRender from '~/components/renders/RectangleRender'
import PolygonRender from '~/components/renders/PolygonRender'
import ArcCircleRender from '~/components/renders/ArcCircleRender'
import ImageRender from '~/components/renders/ImageRender'
import FillRender from '~/components/renders/FillRender'
import TextRender from '~/components/renders/TextRender'
import GradientRender from '~/components/renders/GradientRender'

const DOMParser = require('xmldom').DOMParser

export default {
  components: {
    Gallery,
    FormColorInputRow,
    FormInputRow,
    PublishedEdge,
    ModelEdit,

    RectangleRender,
    PolygonRender,
    ArcCircleRender,
    ImageRender,
    FillRender,
    TextRender,
    GradientRender
  },
  data() {
    return {
      error: null,
      loaded: false,
      borderWidth: 1.5,
      hoveredStep: null,
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
    ...mapState([
      'steps',
      'width',
      'height',
      'edge',
      'edgesBefore',
      'edgesAfter'
    ]),
    ...mapState('renders', ['supportedRenders'])
  },
  watch: {
    edge: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.loadGalleryItems()
          this.loadSurroundingEdges()
        }
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
    this.setEdge({ country, magazine, issuenumber })

    await this.$axios
      .$get(this.getEdgeUrl(vm.edge.issuenumber, 'svg'))
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
          return
        }
        vm.setEdge({
          id: edge.id,
          country: edge.pays,
          magazine: edge.magazine,
          issuenumber: edge.numero
        })
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
      return `${process.env.EDGES_URL}/${this.edge.country}/gen/${this.edge.magazine}.${issuenumber}.${extension}`
    },
    exportSvg() {
      const vm = this
      this.zoom = 1.5
      vm.$nextTick().then(() => {
        vm.$axios
          .$put('/fs/export', {
            country: vm.edge.country,
            magazine: vm.edge.magazine,
            issuenumber: vm.edge.issuenumber,
            content: vm.$refs.edge.outerHTML
          })
          .then(() => {
            vm.$bvToast.toast('Export done', {
              toaster: 'b-toaster-top-center'
            })
          })
      })
    },
    ...mapMutations(['setSteps', 'setDimensions', 'setEdge']),
    ...mapMutations('currentStep', ['setStepNumber']),
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
