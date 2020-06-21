<template>
  <form-input-row
    :option-name="optionName"
    :label="`Color${optionName === 'Color' ? '' : ` (${optionName})`}`"
    type="color"
    :options="options"
    :disabled="options[optionName] === 'transparent'"
    ><input
      v-if="canBeTransparent"
      :id="`${optionName}-transparent`"
      :checked="options[optionName] === 'transparent'"
      type="checkbox"
      @change="
        $root.$emit(
          'set-option',
          optionName,
          $event.currentTarget.checked ? 'transparent' : originalColor
        )
      "
    />
    <label v-if="canBeTransparent" :for="`${optionName}-transparent`">Transparent</label>
  </form-input-row>
</template>
<script>
import FormInputRow from '~/components/FormInputRow'

export default {
  components: { FormInputRow },
  props: {
    options: {
      type: Object,
      required: true,
    },
    optionName: {
      type: String,
      required: true,
    },
    canBeTransparent: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let originalColor = this.options[this.optionName]
    if (originalColor === 'transparent') {
      originalColor = '#000000'
    }
    return {
      originalColor,
    }
  },
}
</script>
<style></style>
