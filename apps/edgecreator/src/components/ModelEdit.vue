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
        v-for="(stepOptions, stepNumber) in optionsPerStepNumber"
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
                  (render) => render.component === components[stepNumber]
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
              v-if="
                stepOptions.find(({ optionName }) => optionName === 'visible')
                  ?.optionValue === false
              "
              :title="$t('Click to show')"
              @click.stop="
                stepStore.setOptionValues({ visible: true }, { stepNumber })
              "
            />
            <i-bi-eye-fill
              v-else
              :title="$t('Click to hide')"
              @click.stop="
                stepStore.setOptionValues({ visible: false }, { stepNumber })
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
            :options="stepOptions"
          >
            <template #alert
              >{{
                $t("You can use special text parts to make your text dynamic :")
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
            </template>
          </form-input-row>
          <form-input-row
            option-name="font"
            :label="$t('Font').toString()"
            type="text"
            :options="stepOptions"
            ><a
              target="_blank"
              :href="fontSearchUrl"
              class="position-absolute input-extra"
              >{{ $t("Search") }}</a
            ></form-input-row
          >
          <form-color-input-row
            :options="stepOptions"
            :other-colors="otherColors[stepNumber]"
            option-name="bgColor"
            :label="$t('Background color').toString()"
          />
          <form-color-input-row
            :options="stepOptions"
            :other-colors="otherColors[stepNumber]"
            option-name="fgColor"
            :label="$t('Foreground color').toString()"
          />
          <form-input-row
            option-name="rotation"
            :label="
              $t('Rotation : {rotation}°', {
                rotation: stepOptions.find(({optionName}) => optionName === 'rotation')!.optionValue,
              }).toString()
            "
            type="range"
            :min="0"
            :max="270"
            :range-step="90"
            :options="stepOptions"
          />
          <b-button
            size="sm"
            variant="outline-warning"
            class="d-block mt-3"
            @click="resetPositionAndSize(stepOptions)"
            >{{ $t("Reset position and size") }}
          </b-button>
        </b-card-text>
        <b-card-text v-if="components[stepNumber] === 'Fill'">
          <form-color-input-row
            :other-colors="otherColors[stepNumber]"
            :options="stepOptions"
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
            >{{
              $t(
                editingStepStore.issuenumbers.length === 1
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
            :options="stepOptions"
          >
            <b-form-select
              id="src-list"
              :options="mainStore.publicationElements"
            />
            <gallery
              :items="mainStore.publicationElementsForGallery"
              image-type="elements"
              :selected="
                stepOptions
                  .filter(({ optionName }) => optionName === 'src')
                  .map(({ optionValue }) => optionValue)
              "
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
            :options="stepOptions"
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
            :options="stepOptions"
            :option-name="optionName"
            :label="
              $t(
                optionName === 'colorStart' ? 'Start color' : 'End color'
              ).toString()
            "
          />

          <form-input-row
            type="select"
            :options="stepOptions"
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
            :options="stepOptions"
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
import { editingStep } from "~/stores/editingStep";
import { hoveredStep } from "~/stores/hoveredStep";
import { main } from "~/stores/main";
import { renders } from "~/stores/renders";
import { step, StepOption } from "~/stores/step";

const hoveredStepStore = hoveredStep();
const editingStepStore = editingStep();
const mainStore = main();
const rendersStore = renders();
const stepStore = step();

const emit = defineEmits<{
  (event: "swap-steps", steps: [number, number]): void;
  (event: "duplicate-step", stepNumber: number): void;
  (event: "remove-step", stepNumber: number): void;
  (event: "add-step", component: string): void;
}>();
const issueNumbers = computed(() => mainStore.issuenumbers);

const fontSearchUrl = computed(() => import.meta.env.VITE_FONT_SEARCH_URL);
const optionsPerStepNumber = computed(
  (): Record<number, StepOption[]> =>
    stepStore
      .getFilteredOptions({
        issuenumbers: editingStepStore.issuenumbers,
      })
      .reduce(
        (acc, { stepNumber, ...rest }) => ({
          ...acc,
          [stepNumber]: [...(acc[stepNumber] || []), { stepNumber, ...rest }],
        }),
        {} as Record<number, StepOption[]>
      )
);

const components = computed(() =>
  Object.entries(optionsPerStepNumber.value).reduce(
    (acc, [stepNumber, options]) => ({
      ...acc,
      [stepNumber]: options.find(
        ({ optionName }) => optionName === "component"
      )!.optionValue,
    }),
    {} as Record<number, string>
  )
);

const otherColors = computed(() =>
  Object.keys(optionsPerStepNumber.value)
    .map((currentStepNumber) => parseInt(currentStepNumber))
    .map((currentStepNumber) => ({
      sameIssuenumber: stepStore.colors.filter(
        ({ issuenumber: thisIssuenumber, stepNumber: thisStepNumber }) =>
          issueNumbers.value.includes(thisIssuenumber) &&
          thisStepNumber !== currentStepNumber
      ),
      differentIssuenumber: stepStore.colors.filter(
        ({ issuenumber: thisIssuenumber }) =>
          !issueNumbers.value.includes(thisIssuenumber)
      ),
    }))
);

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);

const resetPositionAndSize = (stepOptions: StepOption[]) => {
  const stepNumber = stepOptions[0].stepNumber;
  for (const issuenumber of editingStepStore.issuenumbers) {
    let issueDimensions = stepStore.getFilteredDimensions({
      issuenumbers: [issuenumber],
    })[0]!;
    stepStore.setOptionValues(
      {
        x: 0,
        y: 0,
        width: issueDimensions.width,
        height:
          issueDimensions.width *
          (stepOptions.find(({ optionName }) => optionName === "aspectRatio")!
            .optionValue as number),
      },
      {
        issuenumbers: [issuenumber],
        stepNumber,
      }
    );
  }
};

const splitImageAcrossEdges = () => {
  let leftOffset = 0;
  const widthSum = editingStepStore.issuenumbers.reduce(
    (acc, issuenumber) =>
      acc +
      stepStore.getFilteredDimensions({
        issuenumbers: [issuenumber],
      })[0]!.width,
    0
  );
  for (const issuenumber of editingStepStore.issuenumbers) {
    const issueDimensions = stepStore.getFilteredDimensions({
      issuenumbers: [issuenumber],
    })[0]!;
    stepStore.setOptionValues(
      {
        x: leftOffset,
        y: 0,
        width: widthSum,
        height: issueDimensions.height,
      },
      { issuenumbers: [issuenumber] }
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

.input-extra {
  top: 3px;
  right: 2rem;
}
</style>
