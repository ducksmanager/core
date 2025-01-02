<template>
  <b-card
    id="edit-card"
    no-body
  >
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
        v-for="stepNumber of stepNumbers"
        :id="`content-${stepNumber}`"
        :key="stepNumber"
        title-link-class="d-flex justify-content-between w-100"
      >
        <template #title>
          <span
            :class="{
              'hovered-step': hoveredStepStore.stepNumber === stepNumber,
            }"
            @mouseover="hoveredStepStore.stepNumber = stepNumber"
            @mouseout="hoveredStepStore.stepNumber = undefined"
          >
            {{
              $t(
                rendersStore.supportedRenders.find(
                  (render) => render.component === components[stepNumber],
                )?.labelL10nKey || "",
              )
            }}
          </span>
          <div class="action-icons">
            <i-bi-arrow-up-square-fill
              :class="{ invisible: stepNumber === 0 }"
              @click.stop="emit('swap-steps', [stepNumber - 1, stepNumber])"
            />
            <i-bi-eye-slash-fill
              v-if="inputValues[stepNumber].visible?.[0] === false"
              :title="$t('Click to show')"
              @click.stop="
                stepStore.setOptionValues(
                  { visible: true },
                  { stepNumber, issuecodes },
                )
              "
            />
            <i-bi-eye-fill
              v-else
              :title="$t('Click to hide')"
              @click.stop="
                stepStore.setOptionValues(
                  { visible: false },
                  { stepNumber, issuecodes },
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
                invisible: stepNumber === stepStore.maxStepNumber,
              }"
              @click.stop="emit('swap-steps', [stepNumber, stepNumber + 1])"
            />
          </div>
        </template>
        <b-card-text v-if="components[stepNumber] === 'Text'">
          <form-input-row
            option-name="text"
            :label="$t('Text').toString()"
            type="text"
            :input-values="inputValues[stepNumber].text"
          >
            <popover
              triggers="hover"
              placement="left"
            >
              <i-bi-info-circle-fill variant="secondary" />
              <template #content>
                <b-alert
                  variant="info"
                  :model-value="true"
                >
                  {{
                    $t(
                      "You can use special text parts to make your text dynamic :",
                    )
                  }}
                  <ul>
                    <i18n-t
                      tag="li"
                      keypath="Write {templateString} to inject in your text the current issue number"
                    >
                      <template #templateString>
                        <pre class="d-inline-block">[Numero]</pre>
                      </template>
                    </i18n-t>
                    <i18n-t
                      tag="li"
                      keypath="Write {templateString1} to inject in your text the first digit of the current issue number, {templateString2} for the second digit, etc."
                    >
                      <template #templateString1>
                        <pre class="d-inline-block">[Numero[0]]</pre>
                      </template>
                      <template #templateString2>
                        <pre class="d-inline-block">[Numero[1]]</pre>
                      </template>
                    </i18n-t>
                  </ul>
                </b-alert>
              </template>
            </popover>
          </form-input-row>
          <form-input-row
            option-name="font"
            :label="$t('Font').toString()"
            type="text"
            :input-values="inputValues[stepNumber].font"
          >
            <a
              target="_blank"
              :href="fontSearchUrl"
            >{{
              $t("Search")
            }}</a>
          </form-input-row>
          <form-color-input-row
            :other-colors="otherColors[stepNumber]"
            option-name="bgColor"
            :input-values="inputValues[stepNumber].bgColor"
            :label="$t('Background color').toString()"
          />
          <form-color-input-row
            :input-values="inputValues[stepNumber].fgColor"
            :other-colors="otherColors[stepNumber]"
            option-name="fgColor"
            :label="$t('Foreground color').toString()"
          />
          <form-input-row
            option-name="rotation"
            :label="
              $t('Rotation : {rotation}°', {
                rotation: inputValues[stepNumber].rotation[0],
              }).toString()
            "
            type="range"
            :min="0"
            :max="270"
            :range-step="90"
            :input-values="inputValues[stepNumber].rotation"
          />
          <b-button
            size="sm"
            variant="outline-warning"
            class="d-block mt-3"
            @click="resetPositionAndSize(stepNumber)"
          >
            {{ $t("Reset position and size") }}
          </b-button>
        </b-card-text>
        <b-card-text v-if="components[stepNumber] === 'Fill'">
          <form-color-input-row
            :other-colors="otherColors[stepNumber]"
            :input-values="inputValues[stepNumber]['fill']"
            option-name="fill"
            :label="$t('Fill color').toString()"
          />
        </b-card-text>
        <b-card-text v-if="components[stepNumber] === 'Image'">
          <b-button
            size="sm"
            variant="outline-warning"
            class="d-block my-3 float-end"
            @click="splitImageAcrossEdges()"
          >
            {{
              $t(
                editingStepStore.issuecodes.length === 1
                  ? "Fill the edge with this image"
                  : "Split this image to fit all selected edges",
              )
            }}
          </b-button>
          <div class="clearfix" />
          <form-input-row
            option-name="src"
            :label="$t('Image').toString()"
            type="text"
            list-id="src-list"
            :input-values="inputValues[stepNumber].src"
          >
            <b-form-select
              id="src-list"
              :options="mainStore.publicationElements"
            />
            <gallery
              :items="mainStore.publicationElementsForGallery"
              image-type="elements"
              :selected="inputValues[stepNumber].src"
              @change="stepStore.setOptionValues({ src: $event })"
            />
          </form-input-row>
        </b-card-text>
        <b-card-text
          v-if="['Rectangle', 'ArcCircle'].includes(components[stepNumber])"
        >
          <form-color-input-row
            v-for="optionName in ['fill', 'stroke']"
            :key="optionName"
            :other-colors="otherColors[stepNumber]"
            :input-values="inputValues[stepNumber][optionName]"
            :option-name="optionName"
            :label="$t(ucFirst(optionName + ' color')).toString()"
            can-be-transparent
          />
        </b-card-text>
        <b-card-text v-if="components[stepNumber] === 'Gradient'">
          <form-color-input-row
            v-for="optionName in ['colorStart', 'colorEnd']"
            :key="optionName"
            :other-colors="otherColors[stepNumber]"
            :input-values="inputValues[stepNumber][optionName]"
            :option-name="optionName"
            :label="
              $t(
                optionName === 'colorStart' ? 'Start color' : 'End color',
              ).toString()
            "
          />

          <form-input-row
            type="select"
            :input-values="inputValues[stepNumber].direction"
            option-name="direction"
            :label="$t('Direction').toString()"
            :select-options="[$t('Vertical'), $t('Horizontal')]"
          />
        </b-card-text>
        <b-card-text v-if="components[stepNumber] === 'Staple'">
          {{ $t("Move and resize the staples directly on the edge.") }}
        </b-card-text>
        <b-card-text v-if="components[stepNumber] === 'Polygon'">
          <form-color-input-row
            :input-values="inputValues[stepNumber].fill"
            :other-colors="otherColors[stepNumber]"
            option-name="fill"
            :label="$t('Fill color').toString()"
          />
        </b-card-text>
      </b-tab>
      <b-tab
        key="99"
        :title="$t('Add step')"
        title-item-class="fw-bold"
      >
        <b-card-text>
          <b-dropdown :text="$t('Select a step type')">
            <b-dropdown-item
              v-for="render in rendersStore.supportedRenders"
              :key="render.component"
              @click="emit('add-step', render.component)"
            >
              {{ $t(render.description) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-card-text>
      </b-tab>
    </b-tabs>
  </b-card>
</template>
<script setup lang="ts">
import { editingStep } from "~/stores/editingStep";
import { hoveredStep } from "~/stores/hoveredStep";
import { main } from "~/stores/main";
import { renders } from "~/stores/renders";
import { step } from "~/stores/step";

const hoveredStepStore = hoveredStep();
const editingStepStore = editingStep();
const mainStore = main();
const rendersStore = renders();
const stepStore = step();

const emit = defineEmits<{
  (event: "swap-steps", steps: [number, number]): void;
  (event: "duplicate-step" | "remove-step", stepNumber: number): void;
  (event: "add-step", component: string): void;
}>();
const { issuecodes } = storeToRefs(mainStore);

const inputValues = computed(
  (): Record<number, Record<string, PossibleInputValueType[]>> =>
    stepStore.options
      .filter(({ issuecode }) =>
        editingStepStore.issuecodes.includes(issuecode),
      )
      .reduce<Record<number, Record<string, PossibleInputValueType[]>>>(
        (acc, { stepNumber, optionName, optionValue }) => {
          const optionValues =
            acc[stepNumber]?.[optionName] === undefined
              ? []
              : acc[stepNumber][optionName];
          return {
            ...acc,
            [stepNumber]: {
              ...(acc[stepNumber] || {}),
              [optionName]: [
                ...optionValues,
                optionValue as PossibleInputValueType,
              ],
            },
          };
        },
        {},
      ),
);

const stepNumbers = computed(() =>
  Object.keys(inputValues.value).map((stepNumber) => parseInt(stepNumber)),
);

const fontSearchUrl = computed(
  () => import.meta.env.VITE_FONT_SEARCH_URL as string,
);

type PossibleInputValueType = string | number | boolean;

const components = computed(() =>
  Object.values(inputValues.value).map(
    (stepOptions) => stepOptions.component[0] as string,
  ),
);

const otherColors = computed(() =>
  stepNumbers.value.map((currentStepNumber) => ({
    sameIssuenumber: stepStore.colors.filter(
      ({ issuecode: thisIssuecode, stepNumber: thisStepNumber }) =>
        issuecodes.value.includes(thisIssuecode) &&
        thisStepNumber !== currentStepNumber,
    ),
    differentIssuenumber: stepStore.colors.filter(
      ({ issuecode: thisIssuecode }) =>
        !issuecodes.value.includes(thisIssuecode),
    ),
  })),
);

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

const resetPositionAndSize = (stepNumber: number) => {
  for (const issuecode of editingStepStore.issuecodes) {
    const issueDimensions = stepStore.getFilteredDimensions({
      issuecodes: [issuecode],
    })[0]!;
    stepStore.setOptionValues(
      {
        x: 0,
        y: 0,
        width: issueDimensions.width,
        height:
          issueDimensions.width *
          (inputValues.value[stepNumber].aspectRatio[0] as number),
      },
      {
        issuecodes: [issuecode],
        stepNumber,
      },
    );
  }
};

const splitImageAcrossEdges = () => {
  let leftOffset = 0;
  const widthSum = editingStepStore.issuecodes.reduce(
    (acc, issuecode) =>
      acc +
      stepStore.getFilteredDimensions({
        issuecodes: [issuecode],
      })[0]!.width,
    0,
  );
  for (const issuecode of editingStepStore.issuecodes) {
    const issueDimensions = stepStore.getFilteredDimensions({
      issuecodes: [issuecode],
    })[0]!;
    stepStore.setOptionValues(
      {
        x: leftOffset,
        y: 0,
        width: widthSum,
        height: issueDimensions.height,
      },
      { issuecodes: [issuecode] },
    );
    leftOffset -= issueDimensions.width;
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
</style>
