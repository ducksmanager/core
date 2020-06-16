<template>
  <b-row>
    <b-col sm="2">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="6" md="5">
      <b-form-input
        :id="optionName"
        size="sm"
        autocomplete="off"
        :type="type"
        :min="min"
        :max="max"
        :range="range"
        :value="userValue"
        :disabled="disabled"
        :list="listId"
        v-on="{
          [isTextImageOption || isImageSrcOption
            ? 'change'
            : 'input']: onChangeValue
        }"
      ></b-form-input>
      <slot />
    </b-col>
  </b-row>
</template>

<script>
export default {
  props: {
    label: { type: String, required: true },
    optionName: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    options: { type: Object, required: true },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    range: { type: Number, default: null },
    listId: { type: String, default: null }
  },
  computed: {
    userValue() {
      const value = this.options[this.optionName]
      if (this.isTextColor) {
        return `#${value}`
      }
      if (this.optionName === 'xlink:href') {
        return value.match(/\/([^/]+)$/)[1]
      }
      return value
    },
    isTextImageOption() {
      return (
        this.options.text &&
        ['fgColor', 'bgColor', 'internalWidth', 'text', 'font'].includes(
          this.optionName
        )
      )
    },
    isImageSrcOption() {
      return !!this.options.src
    },
    isTextColor() {
      return (
        this.isTextImageOption &&
        this.optionName.toLowerCase().includes('color')
      )
    }
  },
  methods: {
    onChangeValue(value) {
      if (this.isTextColor) {
        value = value.replace('#', '')
      }
      this.$root.$emit('set-option', this.optionName, value)
    }
  }
}
</script>

<style scoped></style>
