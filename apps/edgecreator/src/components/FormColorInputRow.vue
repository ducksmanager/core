<template>
  <form-input-row
    type="color"
    :option-name="optionName"
    :label="label || optionName"
    :class="{
      'd-flex': true,
      'color-row': true,
      'can-be-transparent': canBeTransparent,
      'transparent-selected': isTransparent,
    }"
    :options="options"
    :disabled="isTransparent"
    ><template #prefix>
      <b-button
        v-if="canBeTransparent"
        :variant="isTransparent ? 'secondary' : 'outline-light'"
        :pressed="isTransparent"
        class="transparent p-1"
        @click="isTransparent = !isTransparent"
        ><img
          :id="`${optionName}-transparent`"
          alt="transp"
          src="/transparent.png"
        />&nbsp;Transparent</b-button
      ></template
    >

    <template v-if="!isTransparent" #suffix>
      <popover container="body">
        <b-button
          :id="`${optionName}-popover-colors`"
          class="no-pointer"
          pill
          size="sm"
          variant="outline-primary"
          >{{ $t("Re-use") }}
        </b-button>
        <template #content>
          <div
            v-for="(
              otherColorsForLocation, colorLocation
            ) in otherColorsByLocationAndStepNumber"
            :key="colorLocation"
          >
            <h6 v-if="colorLocation === 'sameIssuenumber'">
              {{ $t("Colors used in other steps") }}
            </h6>
            <h6 v-if="colorLocation === 'differentIssuenumber'">
              {{ $t("Colors used in other edges") }}
            </h6>
            <ul>
              <li
                v-for="(_, stepNumber) in otherColorsForLocation"
                :key="`${colorLocation}-${stepNumber}`"
              >
                <span
                  :class="{
                    'text-secondary':
                      !otherColorsForLocation[stepNumber].length,
                  }"
                  >{{ $t("Step") }} {{ stepNumber }}</span
                >
                <span
                  v-for="color in otherColorsForLocation[stepNumber]"
                  :key="color"
                  class="frequent-color"
                  :style="{ background: color }"
                  @click="onColorChange(color)"
                  >&nbsp;</span
                >
              </li>
            </ul>
          </div></template
        ></popover
      >&nbsp;<b-button
        pill
        size="sm"
        :disabled="!hasPhotoUrl || showEdgePhotos === undefined"
        :variant="
          colorPickerOption === optionName ? 'primary' : 'outline-primary'
        "
        @click="colorPickerOption = colorPickerOption ? null : optionName"
        >{{ $t("From photo") }}
      </b-button>
    </template>
  </form-input-row>
</template>
<script setup lang="ts">
import Popover from "~/components/Popover.vue";
import { main } from "~/stores/main";
import { Options, step, StepOption } from "~/stores/step";
import { ui } from "~/stores/ui";

const props = withDefaults(
  defineProps<{
    options: StepOption[];
    optionName: string;
    otherColors: {
      differentIssuenumber: Options;
      sameIssuenumber: Options;
    };
    label?: string | null;
    canBeTransparent?: false | null;
  }>(),
  {
    label: null,
    canBeTransparent: false,
  }
);

const originalColor = ref(null as string | null);

const stepStore = step();

const colorOption = computed(() =>
  props.options.filter(({ optionName }) => optionName === props.optionName)
);
const inputValues = computed(() =>
  colorOption.value.map(({ optionValue }) => optionValue)
);
const isTransparent = ref(false as boolean);
const photoUrls = computed(() => main().photoUrls);
const hasPhotoUrl = computed(() => Object.keys(photoUrls.value).length);
const colorPickerOption = computed(() => ui().colorPickerOption);
const showEdgePhotos = computed(() => ui().showEdgePhotos);

watch(
  () => inputValues.value,
  (inputValues) => {
    isTransparent.value = inputValues[0] === "transparent";
  },
  { immediate: true }
);

const getOptionStringValuesByStepNumber = (options: Options) =>
  options.reduce<Record<number, string[]>>(
    (acc, option) => ({
      ...acc,
      [option.stepNumber]: [
        ...(acc[option.stepNumber] || []),
        option.optionValue as string,
      ],
    }),
    {}
  );

const otherColorsByLocationAndStepNumber = computed(() => ({
  differentIssuenumber: getOptionStringValuesByStepNumber(
    props.otherColors.differentIssuenumber
  ),
  sameIssuenumber: getOptionStringValuesByStepNumber(
    props.otherColors.sameIssuenumber
  ),
}));
watch(
  () => inputValues.value,
  (newValue) => {
    if (newValue) {
      let newColor = inputValues.value[0];
      if (newColor === "transparent") {
        newColor = "#000000";
      }
      originalColor.value = newColor as string;
    }
  },
  { immediate: true }
);

watch(
  () => isTransparent.value,
  (newValue) => {
    stepStore.setOptionValues([
      {
        ...colorOption.value[0],
        optionValue: newValue ? "transparent" : originalColor.value,
      },
    ]);
  }
);

const onColorChange = (value: string) => {
  stepStore.setOptionValues({ [props.optionName]: value });
};
</script>
<style lang="scss" scoped>
ul {
  list-style-type: none;
  padding: 0;
}

:deep(input[type="color"]) {
  display: inline-block;
  padding: 1px;
  background: none !important;
}

.transparent {
  :deep(div) {
    color: black !important;
  }
  * {
    cursor: pointer;
  }
  img {
    top: 0;
  }
}

.color-row.can-be-transparent.transparent-selected label.transparent img,
.color-row.can-be-transparent:not(.transparent-selected) input[type="color"] {
  border: 0;
  padding: 0;
  border-radius: 0.25rem;

  + input[type="color"] {
    border: 0;
  }
}

.transparent-selected {
  label.transparent img {
    border: 1px solid #ced4da !important;
    padding: 1px !important;
  }

  :deep(input[type="color"]) {
    padding: 0;
    border: 0;
  }
}

.btn {
  font-size: smaller;
  vertical-align: top;
  margin-top: -5px;

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
