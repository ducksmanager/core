<template>
  <b-row class="mb-3 d-flex">
    <b-col sm="3" class="d-flex align-items-start">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="9" class="d-flex flex-column align-items-center">
      <div>
        <slot name="prefix" />
        <confirm-edit-multiple-values :values="values" @change="onChangeValue">
          <b-form-select
            v-if="type === 'select'"
            :id="optionName"
            v-model="inputValue"
            :options="selectOptions"
          />
          <b-form-input
            v-else
            :id="optionName"
            v-model="inputValue"
            size="sm"
            autocomplete="off"
            :type="type"
            :min="String(min)"
            :max="String(max)"
            :step="String(rangeStep)"
            :range="range"
            :disabled="disabled || false"
            :list="String(listId)"
            @blur="onBlur"
          />
        </confirm-edit-multiple-values>
      </div>
      <div>
        <slot />
      </div>
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import { step } from "~/stores/step";
import type { OptionValue } from "~/types/OptionValue";

type PossibleInputValueType = string | number;
const {
  disabled = undefined,
  inputValues,
  listId = undefined,
  max = undefined,
  min = undefined,
  optionName,
  range = undefined,
  rangeStep = undefined,
  selectOptions = undefined,
} = defineProps<{
  disabled?: boolean;
  inputValues: PossibleInputValueType[];
  label: string;
  listId?: string;
  max?: number;
  min?: number;
  optionName: string;
  range?: number;
  rangeStep?: number;
  selectOptions?: string[];
  type: "color" | "text" | "range" | "select";
}>();

const shouldWaitForBlurToUpdate = computed(() =>
  ["text", "font"].includes(optionName),
);

const inputValue = ref(inputValues[0] as PossibleInputValueType | undefined);

const values = computed(() => [
  ...new Set(
    optionName === "xlink:href"
      ? (inputValues as string[]).map((value) => value.match(/\/([^/]+)$/)![1])
      : inputValues,
  ),
]);

const onBlur = () => {
  if (shouldWaitForBlurToUpdate.value) {
    onChangeValue(inputValue.value);
  }
};

watch(
  () => inputValues,
  (inputValues) => {
    inputValue.value = inputValues[0] || undefined;
  },
  {
    immediate: true,
  },
);

watch(inputValue, (newValue: PossibleInputValueType | undefined) => {
  if (
    !shouldWaitForBlurToUpdate.value &&
    [...new Set(inputValues)].length <= 1 &&
    newValue !== undefined
  ) {
    onChangeValue(newValue);
  }
});

const onChangeValue = (optionValue: OptionValue) => {
  let intValue: number | null = null;
  if (optionName === "rotation") {
    intValue = parseInt(optionValue as string);
  }
  step().setOptionValues({
    [optionName]: intValue !== null ? intValue : optionValue,
  });
};
</script>

<style lang="scss" scoped>
:deep(.alert) {
  ul {
    padding-left: 1rem;
    margin-bottom: 0;
  }
}
:deep(.edit-wrapper) {
  width: 100%;
}
</style>
