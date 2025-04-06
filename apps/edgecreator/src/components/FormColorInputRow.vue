<template>
  <form-input-row
    v-model="inputValue"
    type="color"
    :option-name="optionName"
    :label="label || optionName"
    :class="{
      'd-flex': true,
      'color-row': true,
      'can-be-transparent': canBeTransparent,
      'transparent-selected': isTransparent,
    }"
    :disabled="isTransparent"
  >
    <template #prefix>
      <b-button
        v-if="canBeTransparent"
        :variant="isTransparent ? 'secondary' : 'outline-light'"
        :pressed="isTransparent"
        class="transparent p-1"
        @click="isTransparent = !isTransparent"
      >
        <img
          :id="`${optionName}-transparent`"
          alt="transp"
          src="/transparent.png"
        />&nbsp;Transparent
      </b-button> </template
    ><template v-if="!isTransparent">
      <popover container="body">
        <b-button
          :id="`${optionName}-popover-colors`"
          class="no-pointer"
          pill
          size="sm"
          variant="outline-primary"
        >
          {{ $t("Re-use") }}
        </b-button>
        <template #content>
          <div
            v-for="(
              otherColorsForLocation, colorLocation
            ) in otherColorsByLocationAndStepNumber"
            :key="colorLocation"
          >
            <template v-if="otherColorsForLocation">
              <h6 v-if="colorLocation === 'sameIssuecode'">
                {{ $t("Colors used in other steps") }}
              </h6>
              <h6 v-if="colorLocation === 'differentIssuecode'">
                {{ $t("Colors used in other edges") }}
              </h6>
              <ul>
                <li
                  v-for="(_, otherStepNumber) in Object.keys(
                    otherColorsForLocation,
                  )"
                  :key="`${colorLocation}-${otherStepNumber}`"
                >
                  <span
                    :class="{
                      'text-secondary':
                        !otherColorsForLocation[otherStepNumber]?.length,
                    }"
                    >{{ $t("Step") }} {{ stepNumber }}</span
                  >
                  <span
                    v-for="color of otherColorsForLocation[otherStepNumber] as string[]"
                    :key="color as string"
                    class="frequent-color"
                    :style="{ background: color as string }"
                    @click="onColorChange(color as string)"
                    >&nbsp;</span
                  >
                </li>
              </ul>
            </template>
          </div>
        </template> </popover
      ><b-button
        class="mt-0"
        pill
        size="sm"
        :disabled="!hasPhotoUrl || showEdgePhotos === undefined"
        :variant="
          colorPickerOption === optionName ? 'primary' : 'outline-primary'
        "
        @click="colorPickerOption = colorPickerOption ? undefined : optionName"
      >
        {{ $t("From photo") }}
      </b-button>
    </template>
  </form-input-row>
</template>
<script setup lang="ts">
import { main } from "~/stores/main";
import type { Options } from "~/stores/step";
import { step } from "~/stores/step";
import { ui } from "~/stores/ui";


const {
  label = null,
  canBeTransparent = false,
  optionName,
} = defineProps<{
  optionName: string;
  label?: string | null;
  canBeTransparent?: false | null;
}>();

const stepNumber = inject<number>("stepNumber");

const inputValue = defineModel<string>();

const originalColor = ref<string>();

const { setOptionValues } = step();
const { photoUrls, issuecodes } = storeToRefs(main());
const { colorPickerOption, showEdgePhotos } = storeToRefs(ui());

const isTransparent = ref(false);
const hasPhotoUrl = computed(() => Object.keys(photoUrls.value).length);

const { colors: allStepColors } = storeToRefs(step());

const otherColors = computed(() => ({
  sameIssuecode: allStepColors.value.filter(
    ({ issuecode: thisIssuecode, stepNumber: thisStepNumber }) =>
      issuecodes.value.includes(thisIssuecode) && thisStepNumber !== stepNumber,
  ),
  differentIssuecode: allStepColors.value.filter(
    ({ issuecode: thisIssuecode }) => !issuecodes.value.includes(thisIssuecode),
  ),
}));

const getOptionStringValuesByStepNumber = (options: Options) =>
  options.groupBy("stepNumber", "optionValue[]");

const otherColorsByLocationAndStepNumber = computed(() => ({
  differentIssuecode:
    issuecodes.value.length === 1
      ? []
      : getOptionStringValuesByStepNumber(otherColors.value.differentIssuecode),
  sameIssuecode: getOptionStringValuesByStepNumber(
    otherColors.value.sameIssuecode,
  ),
}));
watch(
  inputValue,
  (newColor) => {
    isTransparent.value = newColor === "transparent";

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
      optionName,
      optionValue: newValue ? "transparent" : originalColor.value,
    },
  ]);
});

const onColorChange = (value: string) => {
  setOptionValues({ [optionName]: value });
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
