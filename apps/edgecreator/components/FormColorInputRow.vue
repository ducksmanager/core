<template>
  <form-input-row
    type="color"
    :option-name="optionName"
    :label="`Color${optionName === 'Color' ? '' : ` (${optionName})`}`"
    :class="{
      'color-row': true,
      'can-be-transparent': canBeTransparent,
      'transparent-selected': isTransparent,
    }"
    :options="options"
    :disabled="isTransparent"
    ><input
      :id="`${optionName}-transparent`"
      :checked="isTransparent"
      type="checkbox"
      @change="change($event.currentTarget.checked ? 'transparent' : originalColor)"
    />
    <label v-if="canBeTransparent" class="transparent" :for="`${optionName}-transparent`"
      ><img :id="`${optionName}-transparent`" alt="transp" src="/transparent.png"
    /></label>

    <template v-if="!isTransparent" v-slot:suffix>
      <b-button
        :id="`${optionName}-popover-colors`"
        class="no-pointer"
        pill
        size="sm"
        variant="outline-primary"
        >Re-use</b-button
      >
      <b-popover :target="`${optionName}-popover-colors`" triggers="hover focus" placement="bottom">
        <div v-if="!frequentColorsWithoutCurrent.length">No other color</div>
        <ul v-else>
          <li v-for="color in frequentColorsWithoutCurrent" :key="color">
            <span class="frequent-color" :style="{ background: color }" @click="change(color)"
              >&nbsp;</span
            >
          </li>
        </ul>
      </b-popover>
      <b-button
        pill
        size="sm"
        :disabled="!hasPhotoUrl"
        :variant="colorPickerOption === optionName ? 'primary' : 'outline-primary'"
        @click="colorPickerOption = colorPickerOption ? null : optionName"
        >From photo</b-button
      >
    </template>
  </form-input-row>
</template>
<script>
import FormInputRow from '@/components/FormInputRow'
import { mapGetters, mapState } from 'vuex'

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
  computed: {
    isTransparent() {
      return this.options[this.optionName] === 'transparent'
    },
    hasPhotoUrl() {
      return Object.keys(this.photoUrls).length
    },
    colorPickerOption: {
      get() {
        return this.$store.state.ui.colorPickerOption
      },
      set(value) {
        this.$store.commit('ui/setColorPickerOption', value)
      },
    },
    frequentColorsWithoutCurrent() {
      return this.colors.filter((color) => color !== this.options[this.optionName])
    },
    ...mapGetters(['colors']),
    ...mapState(['photoUrls']),
  },
  methods: {
    change(value) {
      this.$root.$emit('set-options', { [this.optionName]: value })
    },
  },
}
</script>
<style>
ul {
  list-style-type: none;
  padding: 0;
}
input[type='color'] {
  display: inline-block;
  width: 40px;
  border: 0;
  background: none !important;
}
input[type='checkbox'][id$='-transparent'] {
  display: none;
}

label.transparent {
  width: 40px;
  margin-right: 20px;
}

label.transparent img {
  position: absolute;
  top: 0;
}

.color-row.can-be-transparent.transparent-selected label.transparent img,
.color-row.can-be-transparent:not(.transparent-selected) input[type='color'] {
  border: 1px dashed black;
}
.btn {
  font-size: smaller;
  vertical-align: top;
}
.btn.no-pointer {
  cursor: default !important;
}
.frequent-color {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: 5px;
  cursor: pointer;
  border: 1px solid black;
  border-radius: 15px;
}
</style>
