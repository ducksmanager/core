<template>
  <b-row class="mb-3 d-flex">
    <b-col sm="3" class="d-flex align-items-start">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="9" class="d-flex flex-column align-items-center">
      <div class="w-100">
        <slot name="prefix" />
        <confirm-edit-multiple-values
          :is-multiple="isMultiple"
          @set-to-first-value="onChangeValue(inputValue!)"
        >
          <b-form-select
            v-if="type === 'select'"
            :id="optionName"
            v-model="inputValue"
            :options="selectOptions"
          />
          <b-form-input
            v-else
            :id="optionName"
            :model-value="inputValue"
            size="sm"
            autocomplete="off"
            :type="type"
            :min="min === undefined ? undefined : String(min)"
            :max="max === undefined ? undefined : String(max)"
            :step="rangeStep === undefined ? undefined : String(rangeStep)"
            :range="range"
            :disabled="disabled || false"
            :list="listId === undefined ? undefined : String(listId)"
            @update:model-value="
              shouldWaitForBlurToUpdate ? () => {} : onChangeValue($event)
            "
            @blur="onChangeValue($event.target.value)"
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
type PossibleInputValueType = string | number;
const {
  disabled = undefined,
  listId = undefined,
  max = undefined,
  min = undefined,
  optionName,
  range = undefined,
  rangeStep = undefined,
  selectOptions = undefined,
} = defineProps<{
  disabled?: boolean;
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

const stepOptionsWithMultipleValues = inject<Ref<string[]>>(
  "stepOptionsWithMultipleValues",
)!;

const isMultiple = computed(() =>
  stepOptionsWithMultipleValues.value.includes(optionName),
);

const inputValue = defineModel<PossibleInputValueType>();

const shouldWaitForBlurToUpdate = computed(() =>
  ["text", "font"].includes(optionName),
);

const onChangeValue = (optionValue: PossibleInputValueType) => {
  let intValue: number | null = null;
  if (optionName === "rotation") {
    intValue = parseInt(optionValue as string);
  }
  inputValue.value = intValue !== null ? intValue : optionValue;
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
