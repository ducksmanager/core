<template>
  <b-row class="mb-3">
    <b-col sm="3" class="d-flex align-items-center">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="6" class="d-flex align-items-center">
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
        ></b-form-input>
      </confirm-edit-multiple-values>
    </b-col>
    <b-col
      sm="3"
      class="d-flex flex-column align-items-center justify-content-center"
    >
      <slot />
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import { step } from "~/stores/step";
import type { OptionValue } from "~/types/OptionValue";

type PossibleInputValueType = string | number;
const props = withDefaults(
  defineProps<{
    label: string;
    optionName: string;
    type: "color" | "text" | "range" | "select";
    disabled?: boolean;
    inputValues: PossibleInputValueType[];
    min?: number;
    max?: number;
    rangeStep?: number;
    range?: number;
    listId?: string;
    selectOptions?: string[];
  }>(),
  {
    disabled: undefined,
    min: undefined,
    max: undefined,
    rangeStep: undefined,
    range: undefined,
    listId: undefined,
    selectOptions: undefined,
  },
);

const shouldWaitForBlurToUpdate = computed(() =>
  ["text", "font"].includes(props.optionName),
);

const inputValue = ref(
  props.inputValues[0] as PossibleInputValueType | undefined,
);

const values = computed(() => [
  ...new Set(
    props.optionName === "xlink:href"
      ? (props.inputValues as string[]).map(
          (value) => value.match(/\/([^/]+)$/)![1],
        )
      : props.inputValues,
  ),
]);

const onBlur = () => {
  if (shouldWaitForBlurToUpdate.value) {
    onChangeValue(inputValue.value);
  }
};

watch(
  () => props.inputValues,
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
    [...new Set(props.inputValues)].length <= 1 &&
    newValue !== undefined
  ) {
    onChangeValue(newValue);
  }
});

const onChangeValue = (optionValue: OptionValue) => {
  let intValue: number | null = null;
  if (props.optionName === "rotation") {
    intValue = parseInt(optionValue as string);
  }
  step().setOptionValues({
    [props.optionName]: intValue !== null ? intValue : optionValue,
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
