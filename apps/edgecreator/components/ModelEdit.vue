<template>
  <b-card id="edit-card" no-body>
    <b-tabs v-model="currentStepNumber" lazy pills card vertical>
      <b-tab v-for="(step, stepNumber) in steps" :key="stepNumber">
        <template v-slot:title>
          <div
            @mouseover="$emit('hover-step', stepNumber)"
            @mouseleave="$emit('hover-step', null)"
          >
            {{
              supportedRenders.find(
                (render) => render.component === step.component
              ).label
            }}
          </div>
        </template>
        <b-card-text v-if="step.component === 'Text'">
          <form-input-row
            option-name="text"
            label="Text"
            type="text"
            :options="currentStepOptions"
          />
          <form-input-row
            option-name="font"
            label="Font"
            type="text"
            :options="currentStepOptions"
          />
          <form-color-input-row
            :options="currentStepOptions"
            option-name="bgColor"
          />
          <form-color-input-row
            :options="currentStepOptions"
            option-name="fgColor"
          />
          <form-input-row
            option-name="rotation"
            :label="`Rotation : ${currentStepOptions.rotation}°`"
            type="range"
            :min="0"
            :max="360"
            :step="1"
            :options="currentStepOptions"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Fill'">
          <form-color-input-row
            :options="currentStepOptions"
            option-name="fill"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Image'">
          <form-input-row
            option-name="src"
            label="Image"
            type="text"
            readonly
            list-id="src-list"
            :options="currentStepOptions"
          >
            <b-form-datalist id="src-list" :options="galleryItems" />
          </form-input-row>
          <Gallery
            :selected-image="currentStepOptions['src']"
            @image-click="
              ({ image }) => {
                clickedImage = image
              }
            "
          />
        </b-card-text>
        <b-card-text v-if="['Rectangle', 'ArcCircle'].includes(step.component)">
          <form-color-input-row
            v-for="optionName in ['fill', 'stroke']"
            :key="optionName"
            :options="currentStepOptions"
            :option-name="optionName"
            can-be-transparent
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Gradient'">
          <form-color-input-row
            v-for="optionName in ['colorStart', 'colorEnd']"
            :key="optionName"
            :options="currentStepOptions"
            :option-name="optionName"
          />

          <b-row>
            <b-col sm="2">
              <label for="direction">Direction</label>
            </b-col>
            <b-col sm="6" md="5">
              <b-form-select
                id="direction"
                :value="currentStepOptions.direction"
                :options="['Vertical', 'Horizontal']"
                @input="$root.$emit('set-option', 'direction', $event)"
              >
              </b-form-select>
            </b-col>
          </b-row>
        </b-card-text>
        <b-card-text v-if="step.component === 'Polygon'">
          <form-color-input-row
            :options="currentStepOptions"
            option-name="fill"
          />
        </b-card-text>
      </b-tab>
      <b-tab key="99" title="Add step" title-item-class="font-weight-bold">
        <b-card-text>
          <b-dropdown text="Select a step type">
            <b-dropdown-item
              v-for="render in supportedRenders"
              :key="render.component"
              @click="
                addStep({
                  component: render.component,
                  svgGroupElement: null
                })
              "
              >{{ render.description }}
            </b-dropdown-item>
          </b-dropdown>
        </b-card-text>
      </b-tab>
    </b-tabs>
    <b-modal
      id="image-modal"
      scrollable
      ok-title="Select"
      :title="clickedImage"
      @ok="$root.$emit('set-option', 'src', clickedImage)"
    >
      <img :alt="clickedImage" :src="getElementUrl(clickedImage)" />
    </b-modal>
  </b-card>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import FormColorInputRow from '~/components/FormColorInputRow'
import FormInputRow from '~/components/FormInputRow'
import Gallery from '~/components/Gallery'

export default {
  name: 'ModelEdit',
  components: { FormColorInputRow, FormInputRow, Gallery },
  props: {
    hoveredStep: { type: Number, default: null }
  },
  data() {
    return {
      clickedImage: null
    }
  },
  computed: {
    currentStepNumber: {
      get() {
        return this.$store.state.currentStep.stepNumber
      },
      set(value) {
        this.$store.commit('currentStep/setStepNumber', value)
      }
    },
    ...mapState(['galleryItems', 'edge', 'steps']),
    ...mapState('currentStep', { currentStepOptions: 'stepOptions' }),
    ...mapState('renders', ['supportedRenders'])
  },
  methods: {
    getElementUrl(elementFileName) {
      return `${process.env.EDGES_URL}/${this.edge.country}/elements/${elementFileName}`
    },
    ...mapMutations(['addStep'])
  }
}
</script>
<style>
#edit-card,
#edit-card .tabs {
  height: 100%;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}
</style>
