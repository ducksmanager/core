<template>
  <b-row class="mb-2">
    <b-col sm="3">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="9" class="d-flex">
      <slot name="prefix" />
      <confirm-edit-multiple-values :values="values" @change="onChangeValue">
        <b-alert
          v-if="$slots.alert || $slots.alert"
          variant="info"
          :model-value="true"
        >
          <slot name="alert" />
        </b-alert>
        <b-form-select
          v-if="type === 'select'"
          :id="optionName"
          v-model="inputValue"
          :options="selectOptions"
          @input="onChangeValue"
        />
        <b-form-input
          v-else
          :id="optionName"
          v-model="inputValue"
          size="sm"
          autocomplete="off"
          :type="type"
          :min="min"
          :max="max"
          :step="rangeStep"
          :range="range"
          :disabled="disabled"
          :list="listId"
          @change="
            isTextImageOption || isImageSrcOption ? onChangeValue : () => {}
          "
          @input="
            !(isTextImageOption || isImageSrcOption) ? onChangeValue : () => {}
          "
        ></b-form-input>
        <slot />
        <slot name="suffix" />
      </confirm-edit-multiple-values>
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import { step, StepOption } from "~/stores/step";
import { OptionValue } from "~/types/OptionValue";

const props = withDefaults(
  defineProps<{
    label: string;
    optionName: string;
    type: "color" | "text" | "range" | "select";
    disabled?: boolean;
    options: StepOption[];
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
  }
);
type PossibleInputValueType = string | number;

const inputValue = ref(undefined as PossibleInputValueType | undefined);

const inputValues = computed(() =>
  props.options
    .filter(({ optionName }) => optionName === props.optionName)
    .map(({ optionValue }) => optionValue as PossibleInputValueType)
);
let values = computed(() => [
  ...new Set(
    props.optionName === "xlink:href"
      ? (inputValues.value as string[]).map(
          (value) => value!.match(/\/([^/]+)$/)![1]
        )
      : (inputValues.value as PossibleInputValueType[])
  ),
]);
const isTextImageOption = computed(
  () =>
    props.options.some(
      ({ optionName, optionValue }) =>
        optionName === "component" && optionValue === "Text"
    ) &&
    ["fgColor", "bgColor", "internalWidth", "text", "font"].includes(
      props.optionName
    )
);
const isImageSrcOption = computed(() =>
  props.options.some(({ optionName }) => optionName === "src")
);

watch(
  () => inputValues.value,
  (inputValues) => {
    inputValue.value = inputValues[0] || undefined;
  },
  { immediate: true }
);

watch(
  () => inputValue.value,
  (newValue: PossibleInputValueType | undefined) => {
    let intValue: number | null = null;
    if (props.optionName === "rotation") {
      intValue = parseInt(newValue as string);
    }
    step().setOptionValues({
      [props.optionName]: intValue !== null ? intValue : newValue,
    });
  }
);

const onChangeValue = (optionValue: OptionValue) => {
  debugger;
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

  pre {
    margin-bottom: -5px;
  }
}
:deep(.edit-wrapper) {
  width: 100%;
}
</style>
