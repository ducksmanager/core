<template>
  <form-input-row
    type="color"
    :option-name="optionName"
    :label="label || optionName"
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
      @change="
        change($event.currentTarget.checked ? 'transparent' : originalColor)
      "
    />
    <label
      v-if="canBeTransparent"
      class="transparent"
      :for="`${optionName}-transparent`"
      ><img
        :id="`${optionName}-transparent`"
        alt="transp"
        src="/transparent.png"
    /></label>

    <template v-if="!isTransparent" #suffix>
      <b-button
        :id="`${optionName}-popover-colors`"
        class="no-pointer"
        pill
        size="sm"
        variant="outline-primary"
        >{{ $t('Re-use') }}
      </b-button>
      <b-popover
        :target="`${optionName}-popover-colors`"
        triggers="hover focus"
        placement="bottom"
      >
        <div
          v-for="(otherColorsForLocation, colorLocation) in otherColors"
          :key="colorLocation"
        >
          <h6 v-if="colorLocation === 'sameIssuenumber'">
            {{ $t('Colors used in other steps') }}
          </h6>
          <h6 v-if="colorLocation === 'differentIssuenumber'">
            {{ $t('Colors used in other edges') }}
          </h6>
          <ul>
            <li
              v-for="(_, stepNumber) in otherColorsForLocation"
              :key="`${colorLocation}-${stepNumber}`"
            >
              <span
                :class="{
                  'text-secondary': !otherColorsForLocation[stepNumber].length,
                }"
                >{{ $t('Step') }} {{ stepNumber }}</span
              >
              <span
                v-for="color in otherColorsForLocation[stepNumber]"
                :key="color"
                class="frequent-color"
                :style="{ background: color }"
                @click="change(color)"
                >&nbsp;</span
              >
            </li>
          </ul>
        </div>
      </b-popover>
      <b-button
        pill
        size="sm"
        :disabled="!hasPhotoUrl || showEdgePhotos === null"
        :variant="
          colorPickerOption === optionName ? 'primary' : 'outline-primary'
        "
        @click="colorPickerOption = colorPickerOption ? null : optionName"
        >{{ $t('From photo') }}
      </b-button>
    </template>
  </form-input-row>
</template>
<script>
import { mapState, mapWritableState } from 'pinia'
import { ui } from '~/stores/ui'
import { main } from '~/stores/main'
import showEdgePhotosMixin from '@/mixins/showEdgePhotosMixin'
import FormInputRow from '@/components/FormInputRow'

export default {
  components: { FormInputRow },
  mixins: [showEdgePhotosMixin],
  props: {
    options: {
      type: Object,
      required: true,
    },
    optionName: {
      type: String,
      required: true,
    },
    otherColors: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: null,
    },
    canBeTransparent: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapWritableState(ui, ['colorPickerOption']),
    inputValues() {
      return this.options[this.optionName]
    },
    isTransparent() {
      return this.inputValues[0] === 'transparent'
    },
    hasPhotoUrl() {
      return Object.keys(this.photoUrls).length
    },
    ...mapState(main, ['photoUrls']),
  },
  watch: {
    inputValues: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          let originalColor = this.inputValues[0]
          if (originalColor === 'transparent') {
            originalColor = '#000000'
          }
          this.originalColor = originalColor
        }
      },
    },
  },
  methods: {
    change(value) {
      this.$root.$emit('set-options', { [this.optionName]: value })
    },
  },
}
</script>
<style lang="scss" scoped>
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

  img {
    position: absolute;
    top: 0;
  }
}

.color-row.can-be-transparent.transparent-selected label.transparent img,
.color-row.can-be-transparent:not(.transparent-selected) input[type='color'] {
  border: 1px dashed black;
}

.btn {
  font-size: smaller;
  vertical-align: top;

  &.no-pointer {
    cursor: default !important;
  }
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
