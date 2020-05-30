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
        <button @click="exportLogo">Export</button>
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
              :is="step.component"
              v-if="$options.components[step.component]"
              :step-number="stepNumber"
              :svg-group="step.svgGroupElement"
              :db-options="step.dbOptions"
              @update="test"
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
          <b-tabs pills card vertical>
            <b-tab
              v-for="(step, stepNumber) in steps"
              :key="stepNumber"
              :title="step.component.replace('Render', '')"
              :active="currentStepNumber === stepNumber"
              @click="currentStepNumber = stepNumber"
              ><b-card-text v-if="step.component === 'RectangleFunction'">
                <input
                  type="color"
                  name="Couleur"
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
                      $event.currentTarget.value
                    )
                  "
                />
                <b-form-checkbox
                  :checked="currentStepOptions.fill !== 'transparent'"
                  @change="toggleFillStroke"
                >
                  Filled
                </b-form-checkbox>
              </b-card-text></b-tab
            >
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import Vue from 'vue'
import RectangleRender from '~/components/RectangleRender'
import ImageRender from '~/components/ImageRender'

const parser = require('xmldom').DOMParser

export default {
  components: {
    RectangleRender,
    ImageRender
  },
  data() {
    return {
      loaded: false,
      borderWidth: 2,
      currentStepOptions: {}
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
                  component: `${step.nomFonction}Render`,
                  dbOptions: step.options
                }))
            )
          })
      })
  },
  methods: {
    test(options) {
      this.currentStepOptions = options
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
    ...mapMutations(['setSteps', 'setDimensions', 'setEdge'])
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
</style>
