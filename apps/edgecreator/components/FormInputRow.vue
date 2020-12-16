<template>
  <b-row>
    <b-col sm="3">
      <label :for="optionName">{{ label }}</label>
    </b-col>
    <b-col sm="9">
      <b-form-input
        :id="optionName"
        size="sm"
        autocomplete="off"
        :type="type"
        :min="min"
        :max="max"
        :step="step"
        :range="range"
        :value="userValue"
        :disabled="disabled"
        :list="listId"
        v-on="{
          [isTextImageOption || isImageSrcOption ? 'change' : 'input']: onChangeValue,
        }"
      ></b-form-input>
      <slot />
      <slot name="suffix" />
      <b-tooltip
        v-if="hasTooltipSlot"
        custom-class="option-tooltip"
        :target="optionName"
        triggers="click"
        boundary="window"
        placement="top"
      >
        <slot name="tooltip" />
      </b-tooltip>
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
    step: { type: Number, default: null },
    range: { type: Number, default: null },
    listId: { type: String, default: null },
  },
  computed: {
    hasTooltipSlot() {
      return !!this.$slots.tooltip || !!this.$scopedSlots.tooltip
    },
    userValue() {
      const value = this.options[this.optionName]
      if (this.optionName === 'xlink:href') {
        return value.match(/\/([^/]+)$/)[1]
      }
      return value
    },
    isTextImageOption() {
      return (
        this.options.text &&
        ['fgColor', 'bgColor', 'internalWidth', 'text', 'font'].includes(this.optionName)
      )
    },
    isImageSrcOption() {
      return !!this.options.src
    },
  },
  methods: {
    onChangeValue(value) {
      this.$root.$emit('set-options', { [this.optionName]: value })
    },
  },
}
</script>

<style lang="scss">
.option-tooltip {
  .tooltip-inner {
    text-align: left;
    min-width: 300px;

    ul {
      padding-left: 1rem;
    }

    pre {
      display: inline-block;
      line-height: 100%;
      margin-bottom: 0;
      color: #bbb;
    }
  }
}
</style>
