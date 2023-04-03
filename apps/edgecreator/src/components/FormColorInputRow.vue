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
    ><template #prefix
      ><label
        v-if="canBeTransparent"
        class="transparent"
        :for="`${optionName}-transparent`"
        ><img
          :id="`${optionName}-transparent`"
          alt="transp"
          src="/transparent.png" /></label
      ><input
        :id="`${optionName}-transparent`"
        :checked="isTransparent"
        type="checkbox"
        @change="onTransparentCheckboxChange"
    /></template>

    <template v-if="!isTransparent" #suffix>
      <popover>
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
            v-for="[colorLocation, otherColorsForLocation] of Object.entries(
              otherColors
            )"
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
import { globalEvent } from "~/stores/globalEvent";
import { main } from "~/stores/main";
import { ui } from "~/stores/ui";
import { OptionValue } from "~/types/OptionValue";

const props = withDefaults(
  defineProps<{
    options: {
      [optionName: string]: OptionValue[];
    };
    optionName: string;
    otherColors: {
      differentIssuenumber: {
        [stepNumber: string]: string[];
      };
      sameIssuenumber: {
        [stepNumber: string]: string[];
      };
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

const inputValues = computed(() => props.options![props.optionName] || []);
const isTransparent = computed(() => inputValues.value[0] === "transparent");
const photoUrls = computed(() => main().photoUrls);
const hasPhotoUrl = computed(() => Object.keys(photoUrls.value).length);
const colorPickerOption = computed(() => ui().colorPickerOption);
const showEdgePhotos = computed(() => ui().showEdgePhotos);

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

const onTransparentCheckboxChange = (event: Event) => {
  globalEvent().setOptionValues({
    options: {
      [props.optionName]: (event.currentTarget as HTMLInputElement).checked
        ? "transparent"
        : originalColor.value,
    },
  });
};

const onColorChange = (value: string) => {
  globalEvent().setOptionValues({ options: { [props.optionName]: value } });
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

input[type="checkbox"][id$="-transparent"] {
  display: none;
}

label.transparent {
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
