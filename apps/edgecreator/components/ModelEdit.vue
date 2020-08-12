<template>
  <b-card id="edit-card" no-body>
    <b-tabs v-model="editingStepNumber" lazy pills card vertical>
      <b-tab v-for="(step, stepNumber) in steps" :key="stepToString(stepNumber, step)">
        <template v-slot:title>
          <span
            :class="{ 'hovered-step': hoveredStepNumber === stepNumber }"
            @mouseover="hoveredStepNumber = stepNumber"
            @mouseout="hoveredStepNumber = null"
          >
            {{ supportedRenders.find((render) => render.component === step.component).label }}
          </span>
          <div class="action-icons">
            <b-icon-arrow-up-square-fill
              v-b-tooltip.hover
              title="Move up"
              :class="{ invisible: stepNumber === 0 }"
              @click="$emit('swap-steps', [stepNumber - 1, stepNumber])"
            />
            <b-icon-square
              stacked
              scale="0.7"
              :style="{ marginTop: '4px' }"
              @click="$emit('duplicate-step', stepNumber)"
            ></b-icon-square>
            <b-icon-square-fill
              v-b-tooltip.hover
              title="Duplicate"
              stacked
              scale="0.7"
              :style="{ marginLeft: '-16px', marginTop: '-4px' }"
              @click="$emit('duplicate-step', stepNumber)"
            ></b-icon-square-fill>
            <b-icon-x-square-fill
              v-b-tooltip.hover
              title="Delete"
              @click="$emit('remove-step', stepNumber)"
            />
            <b-icon-arrow-down-square-fill
              v-b-tooltip.hover
              title="Move down"
              :class="{ invisible: stepNumber === steps.length - 1 }"
              @click="$emit('swap-steps', [stepNumber, stepNumber + 1])"
            />
          </div>
        </template>
        <b-card-text v-if="step.component === 'Text'">
          <form-input-row option-name="text" label="Text" type="text" :options="step.options" />
          <form-input-row option-name="font" label="Font" type="text" :options="step.options" />
          <form-color-input-row :options="step.options" option-name="bgColor" />
          <form-color-input-row :options="step.options" option-name="fgColor" />
          <form-input-row
            option-name="rotation"
            :label="`Rotation : ${step.options.rotation}°`"
            type="range"
            :min="0"
            :max="360"
            :step="1"
            :options="step.options"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Fill'">
          <form-color-input-row :options="step.options" option-name="fill" />
        </b-card-text>
        <b-card-text v-if="step.component === 'Image'">
          <form-input-row
            option-name="src"
            label="Image"
            type="text"
            readonly
            list-id="src-list"
            :options="step.options"
          >
            <b-form-datalist id="src-list" :options="publicationElements" />
          </form-input-row>
          <Gallery image-type="elements" />
        </b-card-text>
        <b-card-text v-if="['Rectangle', 'ArcCircle'].includes(step.component)">
          <form-color-input-row
            v-for="optionName in ['fill', 'stroke']"
            :key="optionName"
            :options="step.options"
            :option-name="optionName"
            can-be-transparent
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Gradient'">
          <form-color-input-row
            v-for="optionName in ['colorStart', 'colorEnd']"
            :key="optionName"
            :options="step.options"
            :option-name="optionName"
          />

          <b-row>
            <b-col sm="2">
              <label for="direction">Direction</label>
            </b-col>
            <b-col sm="6" md="5">
              <b-form-select
                id="direction"
                :value="step.options.direction"
                :options="['Vertical', 'Horizontal']"
                @input="$root.$emit('set-option', 'direction', $event)"
              >
              </b-form-select>
            </b-col>
          </b-row>
        </b-card-text>
        <b-card-text v-if="step.component === 'Polygon'">
          <form-color-input-row :options="step.options" option-name="fill" />
        </b-card-text>
      </b-tab>
      <b-tab key="99" title="Add step" title-item-class="font-weight-bold">
        <b-card-text>
          <b-dropdown text="Select a step type">
            <b-dropdown-item
              v-for="render in supportedRenders"
              :key="render.component"
              @click="$emit('add-step', render.component)"
              >{{ render.description }}
            </b-dropdown-item>
          </b-dropdown>
        </b-card-text>
      </b-tab>
    </b-tabs>
  </b-card>
</template>
<script>
import { mapState } from 'vuex'

import FormColorInputRow from '@/components/FormColorInputRow'
import FormInputRow from '@/components/FormInputRow'
import Gallery from '@/components/Gallery'
import {
  BIconArrowDownSquareFill,
  BIconArrowUpSquareFill,
  BIconSquare,
  BIconSquareFill,
  BIconXSquareFill,
} from 'bootstrap-vue'

export default {
  name: 'ModelEdit',
  components: {
    FormColorInputRow,
    FormInputRow,
    Gallery,
    BIconXSquareFill,
    BIconArrowUpSquareFill,
    BIconArrowDownSquareFill,
    BIconSquare,
    BIconSquareFill,
  },
  props: {
    steps: { type: Array, required: true },
  },
  computed: {
    hoveredStepNumber: {
      get() {
        return this.$store.state.hoveredStep.stepNumber
      },
      set(value) {
        this.$store.commit('hoveredStep/setStepNumber', value)
      },
    },
    editingStepNumber: {
      get() {
        return this.$store.state.editingStep.stepNumber
      },
      set(value) {
        this.$store.commit('editingStep/setStepNumber', value)
      },
    },
    ...mapState(['publicationElements', 'country']),
    ...mapState('renders', ['supportedRenders']),
  },

  methods: {
    stepToString(stepnumber, step) {
      return `${stepnumber}-${
        step.svgGroupElement ? step.svgGroupElement.toString() : JSON.stringify(step.dbOptions)
      }`
    },
  },
}
</script>
<style>
#edit-card,
#edit-card .tabs {
  height: 100%;
}

#edit-card .tabs ul li .action-icons {
  float: right;
}

#edit-card .tabs ul li .b-icon.invisible {
  visibility: hidden;
}

#edit-card .tabs ul li .b-icon {
  height: 15px;
  font-size: initial !important;
  vertical-align: middle;
}

#edit-card .tabs ul li .b-icon:first-of-type {
  margin-left: 5px;
}

.hovered-step {
  animation: glowFilter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}
</style>
