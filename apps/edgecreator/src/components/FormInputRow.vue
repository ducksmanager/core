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
          v-model="values[0]"
          :options="selectOptions"
          @input="onChangeValue"
        />
        <b-form-input
          v-else
          :id="optionName"
          v-model="values[0]"
          size="sm"
          autocomplete="off"
          :type="type"
          :min="min"
          :max="max"
          :step="step"
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
import { globalEvent } from "~/stores/globalEvent";

const props = withDefaults(
  defineProps<{
    label: string;
    optionName: string;
    type: "color" | "text" | "range" | "select";
    disabled?: boolean;
    options: any;
    min?: number;
    max?: number;
    step?: number;
    range?: number;
    listId?: string;
    selectOptions?: string[];
  }>(),
  {
    disabled: undefined,
    min: undefined,
    max: undefined,
    step: undefined,
    range: undefined,
    listId: undefined,
    selectOptions: undefined,
  }
);

const inputValues = computed(() => props.options[props.optionName]);
const values = computed(() =>
  props.optionName === "xlink:href"
    ? (inputValues.value as string[]).map(
        (value) => value!.match(/\/([^/]+)$/)![1]
      )
    : inputValues.value
);
const isTextImageOption = computed(
  () =>
    !!props.options.text &&
    ["fgColor", "bgColor", "internalWidth", "text", "font"].includes(
      props.optionName
    )
);
const isImageSrcOption = computed(() => !!props.options.src);
const onChangeValue = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  let intValue: number | null = null;
  if (props.optionName === "rotation") {
    intValue = parseInt(value);
  }
  globalEvent().options = {
    [props.optionName]: intValue !== null ? intValue : value,
  };
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
