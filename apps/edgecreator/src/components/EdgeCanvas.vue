<!--suppress XmlUnusedNamespaceDeclaration -->
<template>
  <svg
    :id="`edge-canvas-${issuenumber}`"
    ref="canvas"
    :class="{
      'edge-canvas': true,
      'hide-overflow': !showEdgeOverflow,
      'position-relative': true,
      editing: editingStepStore.issuenumbers.includes(issuenumber),
    }"
    :viewBox="`0 0 ${width} ${height}`"
    :width="zoom * width"
    :height="zoom * height"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    preserveAspectRatio="none"
    @mousemove="setPosition"
    @mouseout="uiStore.positionInCanvas = null"
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
          hoveredStepStore.stepNumber === stepNumber &&
          editingStepStore.issuenumbers.includes(issuenumber),
      }"
      @mousedown.exact="
        replaceEditingIssuenumberIfNotAlreadyEditing(issuenumber);
        editingStepStore.stepNumber = stepNumber;
      "
      @mousedown.shift="
        editingStepStore.addIssuenumber(issuenumber);
        editingStepStore.stepNumber = stepNumber;
      "
      @mouseover="
        hoveredStepStore.stepNumber = stepNumber;
        hoveredStepStore.issuenumber = issuenumber;
      "
      @mouseout="
        hoveredStepStore.stepNumber = null;
        hoveredStepStore.issuenumber = null;
      "
    >
      <component
        :is="renderComponents[step.component]"
        v-show="step.options && step.options.visible !== false"
        :issuenumber="issuenumber"
        :step-number="stepNumber"
        :options="step.options"
      ></component>
    </g>
    <rect
      class="border"
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
<script setup lang="ts">
import { editingStep } from "~/stores/editingStep";
import { hoveredStep } from "~/stores/hoveredStep";
import { ui } from "~/stores/ui";

const props = withDefaults(
  defineProps<{
    issuenumber: string;
    dimensions: { width: number; height: number };
    steps: any[];
    photoUrl?: string | null;
    contributors: any;
  }>(),
  { photoUrl: null }
);

const borderWidth = ref(1 as number);

const canvas = ref(null as HTMLElement | null);

const hoveredStepStore = hoveredStep();
const editingStepStore = editingStep();
const uiStore = ui();

const zoom = computed(() => uiStore.zoom);
const showEdgeOverflow = computed(() => uiStore.showEdgeOverflow);
const width = computed(() => props.dimensions.width);
const height = computed(() => props.dimensions.height);

const setPosition = ({ clientX: left, clientY: top }: MouseEvent) => {
  const { left: svgLeft, top: svgTop } = canvas.value!.getBoundingClientRect();
  uiStore.positionInCanvas = [left - svgLeft, top - svgTop].map(
    (value) => value / zoom.value
  ) as [number, number];
};
const replaceEditingIssuenumberIfNotAlreadyEditing = (issuenumber: string) => {
  if (!editingStepStore.issuenumbers.includes(issuenumber)) {
    editingStepStore.replaceIssuenumber(issuenumber);
  }
};
const renderComponents = {
  ArcCircle: defineAsyncComponent(() => import("~renders/ArcCircleRender.vue")),
  Fill: defineAsyncComponent(() => import("~renders/FillRender.vue")),
  Gradient: defineAsyncComponent(() => import("~renders/GradientRender.vue")),
  Image: defineAsyncComponent(() => import("~renders/ImageRender.vue")),
  Polygon: defineAsyncComponent(() => import("~renders/PolygonRender.vue")),
  Rectangle: defineAsyncComponent(() => import("~renders/RectangleRender.vue")),
  Staple: defineAsyncComponent(() => import("~renders/StapleRender.vue")),
  Text: defineAsyncComponent(() => import("~renders/TextRender.vue")),
};
</script>

<style lang="scss">
svg.edge-canvas {
  overflow: visible;

  &.hide-overflow {
    overflow: hidden;
  }

  &:not(.editing) {
    .border {
      stroke: #555;
    }
  }
}
body:not(.interacting) {
  svg.edge-canvas {
    g:hover,
    g.Text:hover image,
    g.hovered,
    g.hovered.Text image {
      animation: glow-filter 2s infinite;
      outline-width: 2px;
      outline-style: dotted;
      outline-offset: -1px;
    }
  }
}
</style>
