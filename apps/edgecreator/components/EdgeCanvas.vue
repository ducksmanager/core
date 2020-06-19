<template>
  <svg
    :id="edgeCanvasId"
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
      @mousedown="
        setEditingIssuenumber(issuenumber)
        setEditingStepNumber(stepNumber)
      "
      @mouseover="hoveredStep = stepNumber"
      @mouseout="hoveredStep = null"
    >
      <component
        :is="`${step.component}Render`"
        v-if="$options.components[`${step.component}Render`]"
        :issuenumber="issuenumber"
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
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import RectangleRender from '~/components/renders/RectangleRender'
import PolygonRender from '~/components/renders/PolygonRender'
import ArcCircleRender from '~/components/renders/ArcCircleRender'
import ImageRender from '~/components/renders/ImageRender'
import FillRender from '~/components/renders/FillRender'
import TextRender from '~/components/renders/TextRender'
import GradientRender from '~/components/renders/GradientRender'

export default {
  name: 'EdgeCanvas',
  components: {
    RectangleRender,
    PolygonRender,
    ArcCircleRender,
    ImageRender,
    FillRender,
    TextRender,
    GradientRender
  },
  props: {
    issuenumber: { type: String, required: true },
    steps: { type: Array, required: true }
  },
  data() {
    return {
      borderWidth: 1.5
    }
  },
  computed: {
    edgeCanvasId() {
      return `edge-canvas-${this.issuenumber}`
    },
    hoveredStep: {
      get() {
        return this.$store.state.editingStep.hoveredStep
      },
      set(value) {
        this.$store.commit('editingStep/setHoveredStep', value)
      }
    },
    ...mapState(['zoom', 'width', 'height'])
  },
  methods: {
    ...mapMutations('editingStep', {
      setEditingStepNumber: 'setStepNumber',
      setEditingIssuenumber: 'setIssuenumber'
    })
  }
}
</script>

<style scoped>
svg g:hover,
svg g.hovered {
  animation: glowFilter 2s infinite;
}
</style>
