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
      v-for="photographer in photographers"
      :key="`photographer-${photographer.user.username}`"
      type="contributor-photographer"
    >
      {{ photographer.user.username }}
    </metadata>
    <metadata
      v-for="designer in designers"
      :key="`designer-${designer.user.username}`"
      type="contributor-designer"
    >
      {{ designer.user.username }}
    </metadata>
    <g
      v-for="(stepComponent, stepNumber) in stepComponentNames"
      :key="stepNumber"
      :is-visible="JSON.stringify(getStepOptions(stepNumber, true))"
      :class="{
        [stepComponent]: true,
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
        :is="renderComponents[stepComponent]"
        v-show="visibleSteps[stepNumber]"
        :issuenumber="issuenumber"
        :step-number="stepNumber"
        :options="toKeyValue(getStepOptions(stepNumber, false))"
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
import type { StepOption } from "~/stores/step";
import { ui } from "~/stores/ui";
import type { OptionNameAndValue } from "~/types/OptionNameAndValue";
import type { ModelContributor } from "~types/ModelContributor";

const props = withDefaults(
  defineProps<{
    issuenumber: string;
    dimensions: { width: number; height: number };
    steps: StepOption[];
    photoUrl?: string | null;
    contributors: Omit<ModelContributor, "issuenumber">[];
  }>(),
  { photoUrl: null },
);

const photographers = computed(() =>
  props.contributors.filter(
    (contributor) => contributor.contributionType === "photographe",
  ),
);
const designers = computed(() =>
  props.contributors.filter(
    (contributor) => contributor.contributionType === "createur",
  ),
);

const stepComponents = computed(() =>
  props.steps.filter(({ optionName }) => optionName === "component"),
);

const stepComponentNames = computed(() =>
  stepComponents.value.map(({ optionValue }) => optionValue as string),
);

const visibleSteps = computed(() =>
  stepComponents.value.map(
    ({ stepNumber }) =>
      !getStepOptions(stepNumber).some(
        ({ optionName, optionValue }) =>
          optionName === "visible" && optionValue === false,
      ),
  ),
);

const getStepOptions = (stepNumber: number, withComponentOption = true) =>
  props.steps.filter(
    ({ stepNumber: thisStepNumber, optionName }) =>
      stepNumber === thisStepNumber &&
      (withComponentOption || optionName !== "component"),
  );

const toKeyValue = (arr: OptionNameAndValue[]) => {
  const val = arr.reduce(
    (acc, { optionName, optionValue }) => ({
      ...acc,
      [optionName]: optionValue,
    }),
    {},
  );
  return Object.keys(val).length ? val : undefined;
};
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
    (value) => value / zoom.value,
  ) as [number, number];
};
const replaceEditingIssuenumberIfNotAlreadyEditing = (issuenumber: string) => {
  if (!editingStepStore.issuenumbers.includes(issuenumber)) {
    editingStepStore.replaceIssuenumber(issuenumber);
  }
};
const renderComponents: Record<string, unknown> = {
  ArcCircle: defineAsyncComponent(
    () => import("./renders/ArcCircleRender.vue"),
  ),
  Fill: defineAsyncComponent(() => import("./renders/FillRender.vue")),
  Gradient: defineAsyncComponent(() => import("./renders/GradientRender.vue")),
  Image: defineAsyncComponent(() => import("./renders/ImageRender.vue")),
  Polygon: defineAsyncComponent(() => import("./renders/PolygonRender.vue")),
  Rectangle: defineAsyncComponent(
    () => import("./renders/RectangleRender.vue"),
  ),
  Staple: defineAsyncComponent(() => import("./renders/StapleRender.vue")),
  Text: defineAsyncComponent(() => import("./renders/TextRender.vue")),
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
    g.Text:hover image,
    g.hovered.Text image,
    g.Rectangle:hover rect,
    g.hovered.Rectangle rect {
      animation: glow-filter 2s infinite;
      animation-timing-function: linear;
      outline-width: 1px;
      outline-style: double;
    }
  }
}
</style>
