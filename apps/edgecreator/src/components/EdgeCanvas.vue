<!--suppress XmlUnusedNamespaceDeclaration -->
<template>
  <svg
    :id="`edge-canvas-${issuecode}`"
    ref="canvas"
    :class="{
      'edge-canvas': true,
      'hide-overflow': !showEdgeOverflow,
      'position-relative': true,
      editing: issuecodes.includes(issuecode),
    }"
    :viewBox="`0 0 ${width} ${height}`"
    :width="zoom * width"
    :height="zoom * height"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    preserveAspectRatio="none"
    @mousemove="setPosition"
    @mouseout="positionInCanvas = undefined"
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
      :class="{
        [stepComponent]: true,
        hovered:
          hoveredStepStore.stepNumber === stepNumber &&
          issuecodes.includes(issuecode),
      }"
      @mousedown.exact="
        replaceEditingIssuecodeIfNotAlreadyEditing(issuecode);
        editingStepStore.stepNumber = stepNumber;
      "
      @mousedown.shift="
        editingStepStore.addIssuecode(issuecode);
        editingStepStore.stepNumber = stepNumber;
      "
      @mouseover="
        hoveredStepStore.stepNumber = stepNumber;
        hoveredStepStore.issuecode = issuecode;
      "
      @mouseout="
        hoveredStepStore.stepNumber = undefined;
        hoveredStepStore.issuecode = undefined;
      "
    >
      <component
        :is="supportedRenders[stepComponent].component"
        v-show="visibleSteps[stepNumber]"
        v-bind="
          getStepOptions(stepNumber, false).groupBy('optionName', 'optionValue') as RenderProps<typeof stepComponent>
        "
        :step-number="stepNumber"
      />
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
import type { ModelContributor } from "~types/ModelContributor";
import { renders } from "~/stores/renders";

const { supportedRenders } = renders();

type RenderProps<T extends keyof typeof supportedRenders> = InstanceType<
  (typeof supportedRenders)[T]["component"]
>["$props"];

const {
  issuecode,
  contributors,
  dimensions,
  steps,
  photoUrl = null,
} = defineProps<{
  issuecode: string;
  dimensions: { width: number; height: number };
  steps: StepOption[];
  photoUrl?: string | null;
  contributors: Omit<ModelContributor, "issuecode">[];
}>();

const optionsPerStepNumber = computed(() => steps.groupBy("stepNumber", "[]"));

const photographers = computed(() =>
  contributors.filter(
    (contributor) => contributor.contributionType === "photographe",
  ),
);
const designers = computed(() =>
  contributors.filter(
    (contributor) => contributor.contributionType === "createur",
  ),
);

const stepComponents = computed(() =>
  steps.filter(({ optionName }) => optionName === "component"),
);

const stepComponentNames = computed(() =>
  stepComponents.value.map(
    ({ optionValue }) => optionValue as keyof typeof supportedRenders,
  ),
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
  optionsPerStepNumber.value[stepNumber].filter(
    ({ optionName }) => withComponentOption || optionName !== "component",
  );

const borderWidth = ref(1);

const canvas = ref<HTMLElement>();

const hoveredStepStore = hoveredStep();
const editingStepStore = editingStep();
const { issuecodes } = storeToRefs(editingStepStore);
const { zoom, showEdgeOverflow, positionInCanvas } = storeToRefs(ui());

const width = computed(() => dimensions.width);
const height = computed(() => dimensions.height);

const setPosition = ({ clientX: left, clientY: top }: MouseEvent) => {
  const { left: svgLeft, top: svgTop } = canvas.value!.getBoundingClientRect();
  positionInCanvas.value = [left - svgLeft, top - svgTop].map(
    (value) => value / zoom.value,
  ) as [number, number];
};
const replaceEditingIssuecodeIfNotAlreadyEditing = (issuecode: string) => {
  if (!issuecodes.value.includes(issuecode)) {
    editingStepStore.replaceIssuecode(issuecode);
  }
};

provide("issuecode", issuecode);
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
