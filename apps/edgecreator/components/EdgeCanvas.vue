<!--suppress XmlUnusedNamespaceDeclaration -->
<template>
  <svg
    :id="`edge-canvas-${issuenumber}`"
    :viewBox="`0 0 ${width} ${height}`"
    :width="zoom * width"
    :height="zoom * height"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    preserveAspectRatio="none"
  >
    <metadata v-if="photoUrl" type="photo">
      {{ photoUrl }}
    </metadata>
    <metadata
      v-for="photographer in contributors.photographers"
      :key="`photographer-${photographer.username}`"
      type="contributor-photographer"
    >
      {{ photographer.username }}
    </metadata>
    <metadata
      v-for="designer in contributors.designers"
      :key="`designer-${designer.username}`"
      type="contributor-designer"
    >
      {{ designer.username }}
    </metadata>
    <g
      v-for="(step, stepNumber) in steps"
      :key="stepNumber"
      :class="{
        [step.component]: true,
        hovered:
          hoveredStepNumber === stepNumber && [issuenumber, null].includes(hoveredIssuenumber),
      }"
      @mousedown="
        editingIssuenumber = issuenumber
        editingStepNumber = stepNumber
      "
      @mouseover="
        hoveredStepNumber = stepNumber
        hoveredIssuenumber = issuenumber
      "
      @mouseout="
        hoveredStepNumber = null
        hoveredIssuenumber = null
      "
    >
      <component
        :is="`${step.component}Render`"
        v-if="$options.components[`${step.component}Render`]"
        :issuenumber="issuenumber"
        :step-number="stepNumber"
        :options="step.options"
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
import { mapState } from 'vuex'
import RectangleRender from '@/components/renders/RectangleRender'
import PolygonRender from '@/components/renders/PolygonRender'
import ArcCircleRender from '@/components/renders/ArcCircleRender'
import ImageRender from '@/components/renders/ImageRender'
import FillRender from '@/components/renders/FillRender'
import TextRender from '@/components/renders/TextRender'
import GradientRender from '@/components/renders/GradientRender'

export default {
  name: 'EdgeCanvas',
  components: {
    RectangleRender,
    PolygonRender,
    ArcCircleRender,
    ImageRender,
    FillRender,
    TextRender,
    GradientRender,
  },
  props: {
    issuenumber: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    steps: { type: Array, required: true },
    photoUrl: { type: String, default: null },
    contributors: { type: Object, required: true },
  },
  data() {
    return {
      borderWidth: 1.5,
    }
  },
  computed: {
    hoveredStepNumber: {
      get() {
        return this.$store.state.hoveredStep.stepNumber
      },
      set(value) {
        this.$store.commit('hoveredStep/setStepNumber', value)
      },
    },
    hoveredIssuenumber: {
      get() {
        return this.$store.state.hoveredStep.issuenumber
      },
      set(value) {
        this.$store.commit('hoveredStep/setIssuenumber', value)
      },
    },
    editingStepNumber: {
      get() {
        return this.$store.state.editingStep.stepNumber
      },
      set(value) {
        this.$store.commit('editingStep/setStepNumber', value)
      },
    },
    editingIssuenumber: {
      get() {
        return this.$store.state.editingStep.issuenumber
      },
      set(value) {
        this.$store.commit('editingStep/setIssuenumber', value)
      },
    },
    ...mapState('ui', ['zoom']),
  },
}
</script>

<style scoped>
svg g:hover,
svg g.hovered {
  animation: glowFilter 2s infinite;
}
</style>
