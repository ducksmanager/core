<!--suppress XmlUnusedNamespaceDeclaration -->
<template>
  <svg
    :id="`edge-canvas-${issuenumber}`"
    ref="canvas"
    :class="{ 'hide-overflow': !showEdgeOverflow, 'position-relative': true }"
    :viewBox="`0 0 ${width} ${height}`"
    :width="zoom * width"
    :height="zoom * height"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    preserveAspectRatio="none"
    @mousemove="setPosition"
    @mouseout="setPositionInCanvas(null)"
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
        addEditingIssuenumber(issuenumber)
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
        v-show="step.options.visible !== false"
        :issuenumber="issuenumber"
        :dimensions="dimensions"
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
import { mapMutations, mapState } from 'vuex'
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
    dimensions: { type: Object, required: true },
    steps: { type: Array, required: true },
    photoUrl: { type: String, default: null },
    contributors: { type: Object, required: true },
  },
  data() {
    return {
      borderWidth: 1,
    }
  },
  computed: {
    ...mapState('user', ['allUsers']),
    width() {
      return this.dimensions.width
    },
    height() {
      return this.dimensions.height
    },
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
    editingIssuenumbers: {
      get() {
        return this.$store.state.editingStep.issuenumbers
      },
      set(value) {
        this.$store.commit('editingStep/setIssuenumber', value)
      },
    },
    ...mapState('ui', ['zoom', 'showEdgeOverflow']),
  },

  mounted() {
    const vm = this
    this.addContributor({
      issuenumber: this.issuenumber,
      contributionType: 'designers',
      user: this.allUsers.find((user) => user.username === vm.$cookies.get('dm-user')),
    })
  },

  methods: {
    ...mapMutations(['addContributor']),
    ...mapMutations('ui', ['setPositionInCanvas']),
    ...mapMutations('editingStep', { addEditingIssuenumber: 'addIssuenumber' }),
    setPosition({ clientX: left, clientY: top }) {
      const vm = this
      const { left: svgLeft, top: svgTop } = this.$refs.canvas.getBoundingClientRect()
      this.setPositionInCanvas(
        [left - svgLeft, top - svgTop].map((value) => parseInt(value / vm.zoom))
      )
    },
  },
}
</script>

<style scoped lang="scss">
svg {
  overflow: visible;

  &.hide-overflow {
    overflow: hidden;
  }

  g:hover,
  g.hovered {
    animation: glow-filter 2s infinite;
  }
}
</style>
