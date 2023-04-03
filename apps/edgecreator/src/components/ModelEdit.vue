<template>
  <b-card id="edit-card" no-body>
    <b-tabs
      v-model="editingStepStore.stepNumber"
      lazy
      pills
      card
      nav-wrapper-class="col-auto h-100 m-0 p-0"
      nav-class="m-0 p-0"
      vertical
      content-class="col h-100"
    >
      <b-tab
        v-for="(step, stepNumber) in optionsPerName"
        :key="stepNumber"
        title-link-class="d-flex justify-content-between w-100"
      >
        <template #title>
          <span
            :class="{
              'hovered-step': hoveredStepStore.stepNumber === stepNumber,
            }"
            @mouseover="hoveredStepStore.stepNumber = stepNumber"
            @mouseout="hoveredStepStore.stepNumber = null"
          >
            {{
              $t(
                rendersStore.supportedRenders.find(
                  (render) => render.component === step.component
                )?.labelL10nKey || ""
              )
            }}
          </span>
          <div class="action-icons">
            <i-bi-arrow-up-square-fill
              :class="{ invisible: stepNumber === 0 }"
              @click.stop="emit('swap-steps', [stepNumber - 1, stepNumber])"
            />
            <i-bi-eye-slash-fill
              v-if="step.options.visible?.[0] === false"
              :title="$t('Click to show')"
              @click.stop="
                globalEventStore.setOptionValues(
                  { options: { visible: true } },
                  { stepNumber }
                )
              "
            />
            <i-bi-eye-fill
              v-else
              :title="$t('Click to hide')"
              @click.stop="
                globalEventStore.setOptionValues(
                  { options: { visible: false } },
                  { stepNumber }
                )
              "
            />
            <i-bi-front
              :title="$t('Duplicate')"
              @click.stop="emit('duplicate-step', stepNumber)"
            />
            <i-bi-x-square-fill
              v-b-tooltip="{ title: $t('Delete') }"
              @click.stop="emit('remove-step', stepNumber)"
            />
            <i-bi-arrow-down-square-fill
              :class="{
                invisible:
                  stepNumber === steps[Object.keys(steps)[0]].length - 1,
              }"
              @click.stop="emit('swap-steps', [stepNumber, stepNumber + 1])"
            />
          </div>
        </template>
        <b-card-text v-if="step.component === 'Text'">
          <form-input-row
            option-name="text"
            :label="$t('Text').toString()"
            type="text"
            :options="step.options"
          >
            <template #alert
              >{{
                $t("You can use special text parts to make your text dynamic :")
              }}
              <ul>
                <i18n
                  tag="li"
                  keypath="Write {templateString} to inject in your text the current issue number"
                >
                  <template #templateString>
                    <pre class="d-inline-block">[Numero]</pre>
                  </template>
                </i18n>
                <i18n
                  tag="li"
                  keypath="Write {templateString1} to inject in your text the first digit of the current issue number, {templateString2} for the second digit, etc."
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
            :label="$t('Font').toString()"
            type="text"
            :options="step.options"
            ><a
              target="_blank"
              :href="fontSearchUrl"
              class="position-absolute input-extra"
              >{{ $t("Search") }}</a
            ></form-input-row
          >
          <form-color-input-row
            :options="step.options"
            :other-colors="otherColors[stepNumber]"
            option-name="bgColor"
            :label="$t('Background color').toString()"
          />
          <form-color-input-row
            :options="step.options"
            :other-colors="otherColors[stepNumber]"
            option-name="fgColor"
            :label="$t('Foreground color').toString()"
          />
          <form-input-row
            option-name="rotation"
            :label="
              $t('Rotation : {rotation}°', {
                rotation: step.options.rotation,
              }).toString()
            "
            type="range"
            :min="0"
            :max="270"
            :step="90"
            :options="step.options"
          />
          <b-button
            size="sm"
            variant="outline-warning"
            class="d-block mt-3"
            @click="resetPositionAndSize(step)"
            >{{ $t("Reset position and size") }}
          </b-button>
        </b-card-text>
        <b-card-text v-if="step.component === 'Fill'">
          <form-color-input-row
            :other-colors="otherColors[stepNumber]"
            :options="step.options"
            option-name="fill"
            :label="$t('Fill color').toString()"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Image'">
          <b-button
            size="sm"
            variant="outline-warning"
            class="d-block my-3 float-end"
            @click="splitImageAcrossEdges()"
            >{{
              $t(
                Object.keys(steps).length === 1
                  ? "Fill the edge with this image"
                  : "Split this image to fit all selected edges"
              )
            }}
          </b-button>
          <div class="clearfix" />
          <form-input-row
            option-name="src"
            :label="$t('Image').toString()"
            type="text"
            list-id="src-list"
            :options="step.options"
          >
            <b-form-select
              id="src-list"
              :options="mainStore.publicationElements"
            />
            <gallery
              :items="mainStore.publicationElementsForGallery"
              image-type="elements"
              :selected="step.options.src"
              @change="
                globalEventStore.setOptionValues({ options: { src: $event } })
              "
            />
          </form-input-row>
        </b-card-text>
        <b-card-text v-if="['Rectangle', 'ArcCircle'].includes(step.component)">
          <form-color-input-row
            v-for="optionName in ['fill', 'stroke']"
            :key="optionName"
            :other-colors="otherColors[stepNumber]"
            :options="step.options"
            :option-name="optionName"
            :label="$t(ucFirst(optionName + ' color')).toString()"
            can-be-transparent
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Gradient'">
          <form-color-input-row
            v-for="optionName in ['colorStart', 'colorEnd']"
            :key="optionName"
            :other-colors="otherColors[stepNumber]"
            :options="step.options"
            :option-name="optionName"
            :label="
              $t(
                optionName === 'colorStart' ? 'Start color' : 'End color'
              ).toString()
            "
          />

          <form-input-row
            type="select"
            :options="step.options"
            option-name="direction"
            :label="$t('Direction').toString()"
            :select-options="[$t('Vertical'), $t('Horizontal')]"
          />
        </b-card-text>
        <b-card-text v-if="step.component === 'Staple'">
          {{ $t("Move and resize the staples directly on the edge.") }}
        </b-card-text>
        <b-card-text v-if="step.component === 'Polygon'">
          <form-color-input-row
            :options="step.options"
            :other-colors="otherColors[stepNumber]"
            option-name="fill"
            :label="$t('Fill color').toString()"
          />
        </b-card-text>
      </b-tab>
      <b-tab key="99" :title="$t('Add step')" title-item-class="fw-bold">
        <b-card-text>
          <b-dropdown :text="$t('Select a step type')">
            <b-dropdown-item
              v-for="render in rendersStore.supportedRenders"
              :key="render.component"
              @click="emit('add-step', render.component)"
              >{{ $t(render.description) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-card-text>
      </b-tab>
    </b-tabs>
  </b-card>
</template>
<script setup lang="ts">
import { Translation as I18n } from "vue-i18n";

import { editingStep } from "~/stores/editingStep";
import { globalEvent } from "~/stores/globalEvent";
import { hoveredStep } from "~/stores/hoveredStep";
import { main } from "~/stores/main";
import { renders } from "~/stores/renders";
import { OptionValue } from "~/types/OptionValue";

const hoveredStepStore = hoveredStep();
const editingStepStore = editingStep();
const mainStore = main();
const rendersStore = renders();
const globalEventStore = globalEvent();

const props = defineProps<{
  dimensions: { [issuenumber: string]: { width: number; height: number } };
}>();

const steps = computed(() => editingStepStore.editingOptions);

const emit = defineEmits<{
  (event: "swap-steps", steps: [number, number]): void;
  (event: "duplicate-step", stepNumber: number): void;
  (event: "remove-step", stepNumber: number): void;
  (event: "add-step", component: string): void;
}>();
const issueNumbers = computed(() => mainStore.issuenumbers);

const fontSearchUrl = computed(() => import.meta.env.VITE_FONT_SEARCH_URL);
const optionsPerName = computed(() =>
  Object.entries(steps.value).map(([stepNumber, step]) => ({
    ...step,
    stepNumber,
    options: Object.keys(step.options || {}).reduce(
      (acc, optionName) => ({
        ...acc,
        [optionName]: [
          ...new Set(
            issueNumbers.value.map(
              (issuenumber) =>
                steps.value[parseInt(stepNumber)].options![issuenumber][
                  optionName
                ]
            )
          ),
        ],
      }),
      {} as Record<string, OptionValue[]>
    ),
  }))
);

const emptyColorList = computed(() =>
  Object.keys(globalEventStore.stepColors).reduce(
    (acc, stepNumber) => ({ ...acc, [stepNumber]: [] }),
    {}
  )
);

const otherColors = computed(() =>
  Object.keys(optionsPerName.value)
    .map((currentStepNumber) => parseInt(currentStepNumber))
    .map((currentStepNumber) => {
      const otherColors: {
        differentIssuenumber: { [stepNumber: string]: string[] };
        sameIssuenumber: { [stepNumber: string]: string[] };
      } = {
        sameIssuenumber: { ...emptyColorList.value },
        differentIssuenumber: {},
      };
      if (issueNumbers.value.length > 1) {
        otherColors.differentIssuenumber = { ...emptyColorList.value };
      }
      for (const issuenumber of issueNumbers.value) {
        (globalEventStore.stepColors[issuenumber] || []).forEach(
          (stepColors, stepNumber) => {
            const isCurrentIssueNumber =
              editingStepStore.issuenumbers.includes(issuenumber);
            if (!(isCurrentIssueNumber && currentStepNumber === stepNumber)) {
              const otherColorGroupKey = isCurrentIssueNumber
                ? "sameIssuenumber"
                : "differentIssuenumber";
              otherColors[otherColorGroupKey]![stepNumber] = [
                ...new Set([
                  ...otherColors[otherColorGroupKey]![stepNumber],
                  ...stepColors,
                ]),
              ];
            }
          }
        );
      }
      return otherColors;
    })
);

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

const resetPositionAndSize = (step: {
  options: { [key: string]: OptionValue[] };
}) => {
  for (const issuenumber of Object.keys(steps.value)) {
    globalEventStore.setOptionValues(
      {
        options: {
          x: 0,
          y: 0,
          width: props.dimensions[issuenumber].width,
          height:
            props.dimensions[issuenumber].width *
            (step.options.aspectRatio[0] as number),
        },
      },
      { issuenumbers: [issuenumber] }
    );
  }
};

const splitImageAcrossEdges = () => {
  let leftOffset = 0;
  const widthSum = Object.keys(steps.value).reduce(
    (acc, issuenumber) => acc + props.dimensions[issuenumber].width,
    0
  );
  for (const issuenumber of Object.keys(steps.value)) {
    globalEventStore.setOptionValues(
      {
        options: {
          x: leftOffset,
          y: 0,
          width: widthSum,
          height: props.dimensions[issuenumber].height,
        },
      },
      { issuenumbers: [issuenumber] }
    );
    leftOffset -= props.dimensions[issuenumber].width;
  }
};
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

        svg {
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

.nav {
  margin: 0 !important;
}

.hovered-step {
  animation: glow-filter 2s infinite;
}

.tab-pane.card-body {
  overflow-y: auto;
  height: 100%;
}

.input-extra {
  top: 3px;
  right: 2rem;
}
</style>
