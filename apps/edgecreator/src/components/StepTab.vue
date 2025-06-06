<template>
  <b-tab
    :id="`content-${stepNumber}`"
    :key="stepNumber"
    title-link-class="d-flex justify-content-between w-100"
  >
    <template #title>
      <span
        :class="{
          'hovered-step': hoveredStepNumber === stepNumber,
        }"
        @mouseover="hoveredStepNumber = stepNumber"
        @mouseout="hoveredStepNumber = undefined"
      >
        {{
          $t(
            componentName in supportedRenders
              ? componentName
              : "Unknown component " + `${componentName}`,
          )
        }}
      </span>
      <div class="action-icons">
        <i-bi-arrow-up-square-fill
          :class="{ invisible: stepNumber === 0 }"
          @click.stop="emit('swap-steps', stepNumber - 1)"
        />
        <i-bi-eye-slash-fill
          v-if="
            'visible' in stepOptionUniqueValues &&
            !stepOptionUniqueValues.visible
          "
          :title="$t('Click to show')"
          @click.stop="
            setOptionValues({ visible: true }, { stepNumber, issuecodes })
          "
        />
        <i-bi-eye-fill
          v-else
          :title="$t('Click to hide')"
          @click.stop="
            setOptionValues({ visible: false }, { stepNumber, issuecodes })
          "
        />
        <i-bi-front
          :title="$t('Duplicate')"
          @click.stop="emit('duplicate-step')"
        />
        <i-bi-x-square-fill
          v-b-tooltip="{ title: $t('Delete') }"
          @click.stop="emit('remove-step')"
        />
        <i-bi-arrow-down-square-fill
          :class="{
            invisible: stepNumber === maxStepNumber,
          }"
          @click.stop="emit('swap-steps', stepNumber + 1)"
        />
      </div>
    </template>
    <b-card-text>
      <component
        :is="supportedRenders[componentName].component"
        ref="renderComponent"
        v-bind="stepOptionUniqueValuesWithoutComponent"
        :step-number="stepNumber"
        v-on="onOptionUpdate"
      />
    </b-card-text>
  </b-tab>
</template>
<script setup lang="ts">
import { editingStep } from "~/stores/editingStep";
import { hoveredStep } from "~/stores/hoveredStep";
import { main } from "~/stores/main";
import { renders } from "~/stores/renders";
import { step } from "~/stores/step";
import type { OptionValue } from "~/types/OptionValue";

const { stepNumber } = defineProps<{
  stepNumber: number;
}>();

provide("stepNumber", stepNumber);

const emit = defineEmits<{
  (event: "swap-steps", otherStep: number): void;
  (event: "duplicate-step" | "remove-step"): void;
}>();

const onOptionUpdate = ref<Record<string, (optionValue: OptionValue) => void>>(
  {},
);

const { stepNumber: hoveredStepNumber } = storeToRefs(hoveredStep());
const { optionsPerStepNumber, maxStepNumber } = storeToRefs(step());
const { issuecodes: editingIssuecodes } = storeToRefs(editingStep());
const { setOptionValues } = step();
const { supportedRenders } = renders();
const { issuecodes } = storeToRefs(main());

const stepOptions = computed(() =>
  optionsPerStepNumber.value[stepNumber].filter(({ issuecode }) =>
    editingIssuecodes.value.includes(issuecode),
  ),
);
const stepOptionUniqueValues = computed(() =>
  stepOptions.value.groupBy("optionName", "optionValue"),
);

const stepOptionUniqueValuesWithoutComponent = computed(() =>
  Object.fromEntries(
    Object.entries(stepOptionUniqueValues.value).filter(
      ([key]) => key !== "component",
    ),
  ),
);

const stepOptionsWithMultipleValues = computed(() =>
  Object.keys(
    Object.fromEntries(
      Object.entries(
        stepOptions.value.groupBy("optionName", "optionValue[]"),
      ).filter(([_optionName, optionValues]) => new Set(optionValues).size > 1),
    ),
  ),
);

provide("stepOptionsWithMultipleValues", stepOptionsWithMultipleValues);

const componentName = computed(
  () =>
    stepOptionUniqueValues.value["component"] as keyof typeof supportedRenders,
);

const renderComponent =
  ref<
    InstanceType<
      (typeof supportedRenders)[typeof componentName.value]["component"]
    >
  >();

watch(renderComponent, () => {
  onOptionUpdate.value = {
    ...onOptionUpdate.value,
    ...Object.keys(renderComponent.value?.$props || {}).groupBy(
      (optionName) => `update:${optionName}`,
      null,
      (optionName) => (optionValue: OptionValue) => {
        step().setOptionValues(
          {
            [optionName]: optionValue,
          },
          {
            stepNumber,
          },
        );
      },
    ),
  };
});
</script>

<style lang="scss" scoped>
.hovered-step {
  animation: glow-filter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}
</style>