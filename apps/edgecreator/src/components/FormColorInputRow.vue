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
    :input-values="inputValues"
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
    ><template v-if="!isTransparent">
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
            <template v-if="otherColorsForLocation">
              <h6 v-if="colorLocation === 'sameIssuenumber'">
                {{ $t("Colors used in other steps") }}
              </h6>
              <h6 v-if="colorLocation === 'differentIssuenumber'">
                {{ $t("Colors used in other edges") }}
              </h6>
              <ul>
                <li
                  v-for="(_, stepNumber) in Object.keys(otherColorsForLocation)"
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
              </ul></template
            >
          </div></template
        ></popover
      ><b-button
        class="mt-0"
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
import { main } from "~/stores/main";
import type { Options } from "~/stores/step";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

type PossibleInputValueType = string | number;
const props = withDefaults(
  defineProps<{
    inputValues: PossibleInputValueType[];
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
  },
);

const originalColor = ref<string | null>(null);

const { setOptionValues } = step();
const { photoUrls, issuecodes } = storeToRefs(main());
const { colorPickerOption, showEdgePhotos } = storeToRefs(ui());

const isTransparent = ref(false);
const hasPhotoUrl = computed(() => Object.keys(photoUrls.value).length);

watch(
  () => props.inputValues,
  (inputValues) => {
    isTransparent.value = inputValues[0] === "transparent";
  },
  { immediate: true },
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
    {},
  );

const otherColorsByLocationAndStepNumber = computed(() => ({
  differentIssuenumber:
    issuecodes.value.length === 1
      ? null
      : getOptionStringValuesByStepNumber(
          props.otherColors.differentIssuenumber,
        ),
  sameIssuenumber: getOptionStringValuesByStepNumber(
    props.otherColors.sameIssuenumber,
  ),
}));
watch(
  () => props.inputValues,
  (newValue) => {
    let newColor = newValue[0];
    if (newColor === "transparent") {
      newColor = "#000000";
    }
    originalColor.value = newColor as string;
  },
  { immediate: true },
);

watch(isTransparent, (newValue) => {
  setOptionValues([
    {
      optionName: props.optionName,
      optionValue: newValue ? "transparent" : originalColor.value,
    },
  ]);
});

const onColorChange = (value: string) => {
  setOptionValues({ [props.optionName]: value });
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
