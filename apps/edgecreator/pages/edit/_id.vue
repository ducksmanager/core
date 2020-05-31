<template>
  <b-container id="wrapper" fluid>
    <b-row>
      <b-col>
        <div>
          <label style="display: inline-block;width: 200px"
            >Zoom : {{ zoom }}
            <input v-model="zoom" type="range" min="1" max="8" step="0.5" />
          </label>
        </div>
      </b-col>
      <b-col>
        <b-button @click="exportLogo">Export</b-button>
      </b-col>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col>
        <svg
          v-if="loaded"
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
            :class="step.component"
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
            :x="borderWidth / 2"
            :y="borderWidth / 2"
            :width="width - borderWidth"
            :height="height - borderWidth"
            fill="none"
            stroke="black"
            :stroke-width="borderWidth"
          />
        </svg>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <b-card no-body>
          <b-tabs v-model="currentStepNumber" pills card vertical>
            <b-tab
              v-for="(step, stepNumber) in steps"
              :key="stepNumber"
              :title="step.component"
              ><b-card-text v-if="step.component === 'Remplir'">
                <form-row id="fill-color" label="Color">
                  <b-form-input
                    id="fill-color"
                    size="sm"
                    type="color"
                    :value="currentStepOptions.fill"
                    @change="$root.$emit('set-option', 'fill', $event)"
                  ></b-form-input></form-row></b-card-text
              ><b-card-text v-if="step.component === 'Image'">
                <form-row id="image-src" label="Image">
                  <b-form-input
                    v-if="currentStepOptions['xlink:href']"
                    id="image-src"
                    size="sm"
                    type="text"
                    readonly
                    :value="
                      currentStepOptions['xlink:href'].match(/\/([^\/]+)$/)[1]
                    "
                  ></b-form-input>
                </form-row>
                <Gallery
                  :selected-image="currentStepOptions['xlink:href']"
                  @image-click="
                    ({ image }) => {
                      clickedImage = image
                    }
                  "
                />
              </b-card-text>
              <b-card-text v-if="step.component === 'Rectangle'">
                <form-row id="rectangle-color" label="Color">
                  <b-form-input
                    id="rectangle-color"
                    size="sm"
                    type="color"
                    :value="
                      currentStepOptions.fill === 'transparent'
                        ? currentStepOptions.stroke
                        : currentStepOptions.fill
                    "
                    @change="
                      $root.$emit(
                        'set-option',
                        currentStepOptions.fill === 'transparent'
                          ? 'stroke'
                          : 'fill',
                        $event
                      )
                    "
                  ></b-form-input>
                </form-row>
                <form-row id="is-filled" label="Filled">
                  <b-form-checkbox
                    id="is-filled"
                    :checked="currentStepOptions.fill !== 'transparent'"
                    @change="toggleFillStroke"
                  >
                  </b-form-checkbox>
                </form-row> </b-card-text
            ></b-tab>
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
import { mapMutations, mapState } from 'vuex'
import Vue from 'vue'
import RectangleRender from '~/components/RectangleRender'
import ImageRender from '~/components/ImageRender'
import RemplirRender from '~/components/RemplirRender'
import Gallery from '~/components/Gallery'
import FormRow from '~/components/FormRow'

const parser = require('xmldom').DOMParser

export default {
  components: {
    RectangleRender,
    ImageRender,
    RemplirRender,
    Gallery,
    FormRow
  },
  data() {
    return {
      loaded: false,
      borderWidth: 2,
      currentStepOptions: {},
      clickedImage: null
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
    ...mapState(['steps', 'width', 'height', 'edge'])
  },
  async mounted() {
    const vm = this
    const edges = await this.$axios.$get('/api/edgecreator/v2/model')
    const edge = edges.find((edge) => edge.id === parseInt(vm.$route.params.id))
    this.setEdge(edge)

    this.setGalleryItems(
      await vm.$axios.$get(`/fs/browseElements/${edge.pays}/${edge.magazine}`)
    )

    this.$axios
      .$get(`/${vm.edge.numero}.svg`)
      .then((data) => {
        const doc = parser.parseFromString(data, 'image/svg+xml')
        const svgElement = doc.getElementsByTagName('svg')[0]
        vm.setDimensions({
          width: svgElement.getAttribute('width'),
          height: svgElement.getAttribute('height')
        })

        vm.loaded = true
        vm.setSteps(
          doc.getElementsByTagName('g').map((group) => ({
            component: group.getAttribute('class'),
            svgGroupElement: group
          }))
        )
      })
      .catch(() => {
        vm.$axios
          .$get(`/api/edgecreator/v2/model/${vm.edge.id}/steps`)
          .then((steps) => {
            vm.loaded = true
            const dimensions = steps.find((step) => step.ordre === -1).options
            vm.setDimensions({
              width: dimensions.Dimension_x,
              height: dimensions.Dimension_y
            })

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
      return `http://localhost:8000/edges/${this.edge.country}/elements/${elementFileName}`
    },
    exportLogo() {
      const vm = this
      this.zoom = 1.5
      Vue.nextTick().then(() => {
        vm.$axios.$put('/api/export', {
          issueNumber: vm.edge.numero,
          content: vm.$refs.edge.outerHTML
        })
      })
    },
    toggleFillStroke() {
      if (this.currentStepOptions.fill !== 'transparent') {
        this.$root.$emit('set-option', 'stroke', this.currentStepOptions.fill)
        this.$root.$emit('set-option', 'fill', 'transparent')
      } else {
        this.$root.$emit('set-option', 'fill', this.currentStepOptions.stroke)
        this.$root.$emit('set-option', 'stroke', 'transparent')
      }
    },
    ...mapMutations(['setSteps', 'setDimensions', 'setEdge', 'setGalleryItems'])
  }
}
</script>
<style>
.draggable {
  cursor: move;
}
svg {
  float: right;
}

svg g:hover {
  animation: glowFilter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}

.row.gallery {
  height: 100px;
}

.row.gallery > div {
  height: 100%;
}

.row.gallery > div > img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.row.gallery > div > img.selected {
  outline: 2px solid #3b8070;
}
.img-thumbnail {
  background: transparent;
}
.img-thumbnail:hover {
  background: black;
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
</style>
