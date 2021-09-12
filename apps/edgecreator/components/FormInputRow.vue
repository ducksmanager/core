<template>
  <b-row>
    <b-col sm="3">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="9">
      <confirm-edit-multiple-values :values="values" @change="onChangeValue">
        <b-alert v-if="hasAlertSlot" show variant="info">
          <slot name="alert" />
        </b-alert>
        <b-form-select
          v-if="type === 'select'"
          :id="optionName"
          :options="selectOptions"
          :value="values[0]"
          @input="onChangeValue"
        />
        <b-form-input
          v-else
          :id="optionName"
          size="sm"
          autocomplete="off"
          :type="type"
          :min="min"
          :max="max"
          :step="step"
          :range="range"
          :value="values[0]"
          :disabled="disabled"
          :list="listId"
          v-on="{
            [isTextImageOption || isImageSrcOption ? 'change' : 'input']:
              onChangeValue,
          }"
        ></b-form-input>
        <slot />
        <slot name="suffix" />
      </confirm-edit-multiple-values>
    </b-col>
  </b-row>
</template>

<script>
import ConfirmEditMultipleValues from '@/components/ConfirmEditMultipleValues'

export default {
  components: { ConfirmEditMultipleValues },
  props: {
    label: { type: String, required: true },
    optionName: { type: String, required: true },
    type: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    options: { type: Object, required: true },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    step: { type: Number, default: null },
    range: { type: Number, default: null },
    listId: { type: String, default: null },
    selectOptions: { type: Array, default: null },
  },

  data: () => ({
    edit: false,
  }),

  computed: {
    hasAlertSlot() {
      return !!this.$slots.alert || !!this.$scopedSlots.alert
    },
    inputValues() {
      return this.options[this.optionName]
    },
    values() {
      if (this.optionName === 'xlink:href') {
        return this.inputValues.map((value) => value.match(/\/([^/]+)$/)[1])
      }
      return this.inputValues
    },
    isTextImageOption() {
      return (
        !!this.options.text &&
        ['fgColor', 'bgColor', 'internalWidth', 'text', 'font'].includes(
          this.optionName
        )
      )
    },
    isImageSrcOption() {
      return !!this.options.src
    },
  },
  methods: {
    onChangeValue(value) {
      if (this.optionName === 'rotation') {
        value = parseInt(value)
      }
      this.$root.$emit('set-options', { [this.optionName]: value })
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .alert {
  ul {
    padding-left: 1rem;
    margin-bottom: 0;
  }

  pre {
    margin-bottom: -5px;
  }
}
</style>
