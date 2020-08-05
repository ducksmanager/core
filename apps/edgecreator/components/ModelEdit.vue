<template>
  <b-card id="edit-card" no-body>
    <b-tabs v-model="editingStepNumber" lazy pills card vertical>
      <b-tab v-for="(step, stepNumber) in steps" :key="stepNumber">
        <template v-slot:title>
          <span
            :class="{ 'hovered-step': hoveredStepNumber === stepNumber }"
            @mouseover="hoveredStepNumber = stepNumber"
            @mouseout="hoveredStepNumber = null"
          >
            {{ supportedRenders.find((render) => render.component === step.component).label }}
          </span>
          <b-icon-x-square-fill class="remove" @click="$emit('remove-step', stepNumber)" />
        </template>
        <b-card-text v-if="step.component === 'Text'">
          <form-input-row
            option-name="text"
            label="Text"
            type="text"
            :options="editingStepOptions"
          />
          <form-input-row
            option-name="font"
            label="Font"
            type="text"
            :options="editingStepOptions"
          />
          <form-color-input-row :options="editingStepOptions" option-name="bgColor" />
          <form-color-input-row :options="editingStepOptions" option-name="fgColor" />
          <form-input-row
            option-name="rotation"
            :label="`Rotation : ${editingStepOptions.rotation}°`"
            type="range"
            :min="0"
            :max="360"
            :step="1"
            :options="editingStepOptions"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Fill'">
          <form-color-input-row :options="editingStepOptions" option-name="fill" />
        </b-card-text>
        <b-card-text v-if="step.component === 'Image'">
          <form-input-row
            option-name="src"
            label="Image"
            type="text"
            readonly
            list-id="src-list"
            :options="editingStepOptions"
          >
            <b-form-datalist id="src-list" :options="publicationElements" />
          </form-input-row>
          <Gallery image-type="elements" />
        </b-card-text>
        <b-card-text v-if="['Rectangle', 'ArcCircle'].includes(step.component)">
          <form-color-input-row
            v-for="optionName in ['fill', 'stroke']"
            :key="optionName"
            :options="editingStepOptions"
            :option-name="optionName"
            can-be-transparent
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Gradient'">
          <form-color-input-row
            v-for="optionName in ['colorStart', 'colorEnd']"
            :key="optionName"
            :options="editingStepOptions"
            :option-name="optionName"
          />

          <b-row>
            <b-col sm="2">
              <label for="direction">Direction</label>
            </b-col>
            <b-col sm="6" md="5">
              <b-form-select
                id="direction"
                :value="editingStepOptions.direction"
                :options="['Vertical', 'Horizontal']"
                @input="$root.$emit('set-option', 'direction', $event)"
              >
              </b-form-select>
            </b-col>
          </b-row>
        </b-card-text>
        <b-card-text v-if="step.component === 'Polygon'">
          <form-color-input-row :options="editingStepOptions" option-name="fill" />
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
import { BIconXSquareFill } from 'bootstrap-vue'

export default {
  name: 'ModelEdit',
  components: { FormColorInputRow, FormInputRow, Gallery, BIconXSquareFill },
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
    ...mapState(['publicationElements', 'country', 'steps']),
    ...mapState('editingStep', { editingStepOptions: 'stepOptions' }),
    ...mapState('renders', ['supportedRenders']),
  },
  methods: {
    getElementUrl(elementFileName) {
      return `${process.env.EDGES_URL}/${this.country}/elements/${elementFileName}`
    },
  },
}
</script>
<style>
#edit-card,
#edit-card .tabs {
  height: 100%;
}

#edit-card .tabs ul li .remove {
  float: right;
  margin-top: 5px;
  margin-left: 10px;
  height: 15px;
}

.hovered-step {
  animation: glowFilter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}
</style>
