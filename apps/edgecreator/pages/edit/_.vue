<template>
  <b-container v-if="error" id="wrapper" fluid>
    {{ error }}
  </b-container>
  <b-container v-else-if="edge" id="wrapper" fluid>
    <b-row align="center">
      <b-col class="text-left">
        <div>
          <label style="display: inline-block;width: 200px"
            >Zoom : {{ zoom }}
            <input v-model="zoom" type="range" min="1" max="8" step="0.5" />
          </label>
        </div>
      </b-col>
      <b-col>
        <b-button to="/">Home</b-button>
        <b-button :disabled="!loaded" @click="exportSvg">Export</b-button>
      </b-col>
      <b-col class="text-right">
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
    <b-row v-if="loaded" align-v="stretch" align-h="center" class="flex-grow-1">
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
                >
                  <component
                    :is="`${step.component}Render`"
                    v-if="$options.components[`${step.component}Render`]"
                    :step-number="stepNumber"
                    :svg-group="step.svgGroupElement"
                    :db-options="step.dbOptions"
                    @update="loadCurrentStepOptions"
                  ></component>
                </g>
                <rect
                  id="border"
                  :x="borderWidth / 4"
                  :y="borderWidth / 4"
                  :width="width - borderWidth / 2"
                  :height="height - borderWidth / 2"
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
          <tr>
            <td v-if="showPreviousEdge && edgesBefore.length">
              {{ edgesBefore[edgesBefore.length - 1].issuenumber }}
            </td>
            <td>{{ edge.issuenumber }}<br />&#11088;</td>
            <td v-if="showNextEdge && edgesAfter.length">
              {{ edgesAfter[0].issuenumber }}
            </td>
          </tr>
        </table>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <b-card id="edit-card" no-body>
          <b-tabs v-model="currentStepNumber" lazy pills card vertical>
            <b-tab v-for="(step, stepNumber) in steps" :key="stepNumber">
              <template v-slot:title>
                <div
                  @mouseover="hoveredStep = stepNumber"
                  @mouseleave="hoveredStep = null"
                >
                  {{ step.component }}
                </div>
              </template>
              <b-card-text v-if="step.component === 'TexteMyFonts'">
                <form-input-row
                  option-name="text"
                  label="Text"
                  type="text"
                  :options="currentStepOptions"
                />
                <form-input-row
                  option-name="font"
                  label="Font"
                  type="text"
                  :options="currentStepOptions"
                />
                <form-input-row
                  option-name="bgColor"
                  label="Background color"
                  type="color"
                  :options="currentStepOptions"
                />
                <form-input-row
                  option-name="fgColor"
                  label="Text color"
                  type="color"
                  :options="currentStepOptions"
                />
                <form-input-row
                  option-name="rotation"
                  :label="`Rotation : ${currentStepOptions.rotation}°`"
                  type="range"
                  :min="0"
                  :max="360"
                  :step="1"
                  :options="currentStepOptions"
                />
              </b-card-text>
              <b-card-text v-if="step.component === 'Remplir'">
                <form-input-row
                  option-name="fill"
                  label="Color"
                  type="color"
                  :options="currentStepOptions"
                />
              </b-card-text>
              <b-card-text v-if="step.component === 'Image'">
                <form-input-row
                  option-name="xlink:href"
                  label="Image"
                  type="text"
                  readonly
                  :options="currentStepOptions"
                />
                <Gallery
                  :selected-image="
                    currentStepOptions['xlink:href']
                      ? currentStepOptions['xlink:href'].match(/\/([^\/]+)$/)[1]
                      : null
                  "
                  @image-click="
                    ({ image }) => {
                      clickedImage = image
                    }
                  "
                />
              </b-card-text>
              <b-card-text v-if="step.component === 'Rectangle'">
                <form-input-row
                  v-for="optionName in ['fill', 'stroke']"
                  :key="optionName"
                  :option-name="optionName"
                  :label="`Color (${optionName})`"
                  type="color"
                  :options="currentStepOptions"
                  :disabled="currentStepOptions[optionName] === 'transparent'"
                  ><input
                    :id="`${optionName}-transparent`"
                    type="checkbox"
                    :checked="currentStepOptions[optionName] === 'transparent'"
                    @change="
                      $root.$emit(
                        'set-option',
                        optionName,
                        $event.currentTarget.checked ? 'transparent' : '#000000'
                      )
                    "
                  />
                  <label :for="`${optionName}-transparent`">Transparent</label>
                </form-input-row>
              </b-card-text></b-tab
            >
            <b-tab key="99" title="Add step"
              ><b-card-text
                ><b-dropdown text="Select a step type"
                  ><b-dropdown-item
                    v-for="render in supportedRenders"
                    :key="render.component"
                    @click="
                      addStep({
                        component: render.component,
                        svgGroupElement: null
                      })
                    "
                    >{{ render.description }}</b-dropdown-item
                  ></b-dropdown
                ></b-card-text
              ></b-tab
            >
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
    <b-modal
      v-if="loaded"
      id="image-modal"
      scrollable
      ok-title="Select"
      :title="clickedImage"
      @ok="$root.$emit('set-option', 'xlink:href', getElementUrl(clickedImage))"
    >
      <img :alt="clickedImage" :src="getElementUrl(clickedImage)" />
    </b-modal>
  </b-container>
</template>
<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import RectangleRender from '~/components/renders/RectangleRender'
import ImageRender from '~/components/renders/ImageRender'
import RemplirRender from '~/components/renders/RemplirRender'
import TexteMyFontsRender from '~/components/renders/TexteMyFontsRender'
import Gallery from '~/components/Gallery'
import FormInputRow from '~/components/FormInputRow'
import PublishedEdge from '~/components/PublishedEdge'

const DOMParser = require('xmldom').DOMParser

export default {
  components: {
    RectangleRender,
    ImageRender,
    RemplirRender,
    TexteMyFontsRender,
    Gallery,
    FormInputRow,
    PublishedEdge
  },
  data() {
    return {
      error: null,
      loaded: false,
      borderWidth: 2,
      currentStepOptions: {},
      clickedImage: null,
      hoveredStep: null,
      showPreviousEdge: true,
      showNextEdge: true,
      supportedRenders: [
        {
          label: 'Rectangle',
          component: 'Rectangle',
          description: 'Draw a rectangle'
        },
        {
          label: 'Image',
          component: 'Image',
          description: 'Insert an image'
        },
        {
          label: 'Fill',
          component: 'Remplir',
          description: 'Fill the edge with a color'
        },
        {
          label: 'Text',
          component: 'TexteMyFontsRender',
          description: 'Insert a text'
        }
      ]
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
    currentStepNumber: {
      get() {
        return this.$store.state.currentStep.stepNumber
      },
      set(value) {
        this.$store.commit('currentStep/setStepNumber', value)
      }
    },
    ...mapState([
      'steps',
      'width',
      'height',
      'edge',
      'edgesBefore',
      'edgesAfter'
    ])
  },
  watch: {
    edge(newValue) {
      if (newValue && newValue.id) {
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
        vm.setEdge(edge)
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
                  component: `${step.nomFonction}`,
                  dbOptions: step.options
                }))
            )
          })
      })
  },
  methods: {
    loadCurrentStepOptions(options) {
      this.currentStepOptions = options
    },
    getElementUrl(elementFileName) {
      return `${process.env.EDGES_URL}/${this.edge.country}/elements/${elementFileName}`
    },
    getEdgeUrl(issuenumber, extension = 'png') {
      return `${process.env.EDGES_URL}/${this.edge.country}/gen/${this.edge.magazine}.${issuenumber}.${extension}`
    },
    exportSvg() {
      const vm = this
      this.zoom = 1.5
      vm.$axios
        .$put('/fs/export', {
          country: vm.edge.country,
          magazine: vm.edge.magazine,
          issuenumber: vm.edge.numero,
          content: vm.$refs.edge.outerHTML
        })
        .then(() => {
          vm.$bvToast.toast('Export done', {
            toaster: 'b-toaster-top-center'
          })
        })
    },
    ...mapMutations([
      'setSteps',
      'addStep',
      'setDimensions',
      'setEdge',
      'setEdgesBefore',
      'setEdgesAfter',
      'setGalleryItems'
    ]),
    ...mapActions(['loadSurroundingEdges', 'loadGalleryItems'])
  }
}
</script>
<style>
#wrapper {
  display: flex;
  flex-direction: column;
}

#edit-card,
#edit-card .tabs {
  height: 100%;
}

.draggable {
  cursor: move;
}

svg g:hover,
svg g.hovered {
  animation: glowFilter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
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

table.edges tr td {
  padding: 0;
  text-align: center;
  vertical-align: top;
}

table.edges tr:last-child td {
  outline: 1px solid grey;
}
</style>
