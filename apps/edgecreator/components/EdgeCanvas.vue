<template>
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
    hoveredStep: { type: Number, default: null }
  },
  data() {
    return {
      borderWidth: 1.5
    }
  },
  computed: {
    ...mapState(['zoom', 'steps', 'width', 'height'])
  },
  methods: {
    ...mapMutations('currentStep', ['setStepNumber'])
  }
}
</script>

<style scoped></style>
