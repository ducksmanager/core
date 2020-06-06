<template>
  <b-row>
    <b-col sm="2">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="6" md="5">
      <b-form-input
        :id="optionName"
        size="sm"
        :type="type"
        :value="userValue"
        :disabled="disabled"
        @change="onChangeValue"
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
    options: { type: Object, required: true }
  },
  computed: {
    userValue() {
      const value = this.options[this.optionName]
      if (this.optionName.toLowerCase().includes('color')) {
        return `#${value}`
      }
      if (this.optionName === 'xlink:href') {
        return value.match(/\/([^/]+)$/)[1]
      }
      return value
    }
  },
  methods: {
    onChangeValue(value) {
      if (this.optionName.toLowerCase().includes('color')) {
        value = value.replace('#', '')
      }
      this.$root.$emit('set-option', this.optionName, value)
    }
  }
}
</script>

<style scoped></style>
