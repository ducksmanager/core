<template>
  <b-card id="edit-card" no-body>
    <b-tabs v-model="editingStepNumber" lazy pills card vertical>
      <b-tab v-for="(step, stepNumber) in optionsPerName" :key="stepNumber">
        <template #title>
          <span
            :class="{ 'hovered-step': hoveredStepNumber === stepNumber }"
            @mouseover="hoveredStepNumber = stepNumber"
            @mouseout="hoveredStepNumber = null"
          >
            {{
              $t(
                supportedRenders.find((render) => render.component === step.component).labelL10nKey
              )
            }}
          </span>
          <div class="action-icons">
            <b-icon-arrow-up-square-fill
              v-b-tooltip.hover
              :title="$t('Move up')"
              :class="{ invisible: stepNumber === 0 }"
              @click.stop="$emit('swap-steps', [stepNumber - 1, stepNumber])"
            />
            <b-icon-eye-slash-fill
              v-if="step.options.visible === false"
              :title="$t('Click to show')"
              @click.stop="$root.$emit('set-options', { stepNumber, visible: true })"
            />
            <b-icon-eye-fill
              v-else
              :title="$t('Click to hide')"
              @click.stop="$root.$emit('set-options', { stepNumber, visible: false })"
            />
            <b-icon-front
              :title="$t('Duplicate')"
              @click.stop="$emit('duplicate-step', stepNumber)"
            />
            <b-icon-x-square-fill
              v-b-tooltip.hover
              :title="$t('Delete')"
              @click.stop="$emit('remove-step', stepNumber)"
            />
            <b-icon-arrow-down-square-fill
              v-b-tooltip.hover
              :title="$t('Move down')"
              :class="{ invisible: stepNumber === steps.length - 1 }"
              @click.stop="$emit('swap-steps', [stepNumber, stepNumber + 1])"
            />
          </div>
        </template>
        <b-card-text v-if="step.component === 'Text'">
          <form-input-row
            option-name="text"
            :label="$t('Text')"
            type="text"
            :options="step.options"
          >
            <template #alert
              >{{ $t('You can use special text parts to make your text dynamic :') }}
              <ul>
                <i18n
                  tag="li"
                  path="Write {templateString} to inject in your text the current issue number"
                >
                  <template #templateString>
                    <pre class="d-inline-block">[Numero]</pre>
                  </template>
                </i18n>
                <i18n
                  tag="li"
                  path="Write {templateString1} to inject in your text the first digit of the current issue number, {templateString2} for the second digit, etc."
                >
                  <template #templateString1>
                    <pre class="d-inline-block">[Numero[0]]</pre>
                  </template>
                  <template #templateString2>
                    <pre class="d-inline-block">[Numero[1]]</pre>
                  </template>
                </i18n>
              </ul>
            </template>
          </form-input-row>
          <form-input-row
            option-name="font"
            :label="$t('Font')"
            type="text"
            :options="step.options"
          />
          <form-color-input-row
            :options="step.options"
            option-name="bgColor"
            :label="$t('Background color')"
          />
          <form-color-input-row
            :options="step.options"
            option-name="fgColor"
            :label="$t('Foreground color')"
          />
          <form-input-row
            option-name="rotation"
            :label="$t('Rotation : {rotation}°', { rotation: step.options.rotation })"
            type="range"
            :min="0"
            :max="270"
            :step="90"
            :options="step.options"
          />
          <b-btn
            size="sm"
            variant="outline-warning"
            class="d-block mt-3"
            @click="
              $root.$emit('set-options', {
                x: 0,
                y: 0,
                width: dimensions.width,
                height: dimensions.width * step.options.aspectRatio,
              })
            "
            >{{ $t('Reset position and size') }}
          </b-btn>
        </b-card-text>
        <b-card-text v-if="step.component === 'Fill'">
          <form-color-input-row
            :options="step.options"
            option-name="fill"
            :label="$t('Fill color')"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Image'">
          <form-input-row
            option-name="src"
            :label="$t('Image')"
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
            :label="$t(ucFirst(optionName + ' color'))"
            can-be-transparent
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Gradient'">
          <form-color-input-row
            v-for="optionName in ['colorStart', 'colorEnd']"
            :key="optionName"
            :options="step.options"
            :option-name="optionName"
            :label="$t(optionName === 'colorStart' ? 'Start color' : 'End color')"
          />

          <form-input-row
            type="select"
            :options="step.options"
            option-name="direction"
            :label="$t('Direction')"
            :select-options="[$t('Vertical'), $t('Horizontal')]"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Polygon'">
          <form-color-input-row
            :options="step.options"
            option-name="fill"
            :label="$t('Fill color')"
          />
        </b-card-text>
      </b-tab>
      <b-tab key="99" :title="$t('Add step')" title-item-class="font-weight-bold">
        <b-card-text>
          <b-dropdown :text="$t('Select a step type')">
            <b-dropdown-item
              v-for="render in supportedRenders"
              :key="render.component"
              @click="$emit('add-step', render.component)"
              >{{ $t(render.descriptionL10nKey) }}
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
  BIconEyeFill,
  BIconEyeSlashFill,
  BIconFront,
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
    BIconEyeFill,
    BIconEyeSlashFill,
    BIconFront,
  },
  props: {
    dimensions: { type: Object, required: true },
    steps: { type: Object, required: true },
  },
  computed: {
    optionsPerName() {
      const vm = this
      const issueNumbers = Object.keys(this.steps)
      return this.steps[issueNumbers[0]].map((step, stepNumber) => ({
        ...step,
        stepNumber,
        options: Object.keys(step.options).reduce(
          (acc, optionName) => ({
            ...acc,
            [optionName]: [
              ...new Set(
                issueNumbers.map(
                  (issuenumber) => vm.steps[issuenumber][stepNumber].options[optionName]
                )
              ),
            ],
          }),
          {}
        ),
      }))
    },
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
    ...mapState('editingStep', { editingIssueNumbers: 'issuenumbers' }),
    ...mapState('renders', ['supportedRenders']),
  },
  methods: {
    ucFirst: (text) => text[0].toUpperCase() + text.substring(1, text.length),
  },
}
</script>
<style lang="scss">
#edit-card {
  height: 100%;

  .tabs {
    height: 100%;

    ul {
      padding: 0;

      li {
        .action-icons {
          float: right;
        }

        .b-icon {
          height: 15px;
          font-size: initial !important;
          vertical-align: middle;

          &.invisible {
            visibility: hidden;
          }

          &:first-of-type {
            margin-left: 5px;
          }
        }
      }
    }
  }
}

.hovered-step {
  animation: glow-filter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}
</style>
