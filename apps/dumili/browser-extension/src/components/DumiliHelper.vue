<template>
  <div class="dumili-helper-app">
    <button
      class="dumili-modal-trigger"
      @click="isModalVisible = !isModalVisible"
    >
      Dumili helper
    </button>
    <div class="dumili-modal" :class="{ hidden: !isModalVisible }">
      <div v-if="countrycode">
        <div
          contenteditable
          class="dumili-output"
          placeholder="Enter Dumili text output"
          @input="content = ($event.target as HTMLDivElement).innerText"
        >
          {{ content }}
        </div>
        <div style="display: flex; justify-content: space-between">
          <button @click="handleNext">Next</button>
          <button @click="handleAuto">ϟ Auto</button>
        </div>
      </div>
      <div v-else>Click on "index a new issue" and select a country</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import $ from "jquery";
import useTextEditor from "~dumili/src/composables/useTextEditor";

interface DumiliData {
  entrycode: string;
}

interface SelectOption {
  value: string;
  text: string;
}

const isModalVisible = ref(true);
const content = ref(`DVBH 56     h3 [inx:Bruno Perel] [pages:116]
DVBH 56a                  1  c                      
DVBH 56p002 D 97006       9  3                      
DVBH 56p011 D 96163       11 3                      
DVBH 56p022               12 3                      
DVBH 56p033               1  3                      
DVBH 56p034               1  i                     `);

const countrycode = ref<string>();
const magazinecode = ref<string>();
const issuenumber = ref<string>();

const pickOption = (dropdownName: string, optionValue: string) => {
  const select = $(`[name='${dropdownName}']`);
  const selectElement = select[0] as HTMLSelectElement;
  if (selectElement) {
    const options = Array.from(selectElement.options) as SelectOption[];
    const matchingOption = options.find(
      (option) => option.value.toLowerCase() === optionValue.toLowerCase()
    );

    if (matchingOption) {
      select.val(matchingOption.value);
      select.trigger("change");
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      window.alert(
        `Option with value ${optionValue} in dropdown ${dropdownName} not found`
      );
    }
  } else {
    window.alert(`Dropdown with name ${dropdownName} not found`);
  }
};

const handleNext = (): void => {
  const { unText } = useTextEditor();
  const data = unText(content.value.trim()) as DumiliData[];

  if (data && data.length > 0) {
    const entrycodeParts = data[0].entrycode.split(" ");
    if (entrycodeParts.length !== 2) {
      window.alert("Invalid entry code format");
      return;
    }

    if (issuenumber.value !== undefined) {
      $("td")
        .filter((_, el) => $(el).text().trim() === "unfinished")
        .eq(0)
        .next()
        .find("a")[0]
        .click();
    }
    if (magazinecode.value) {
      $(`[name='issNotInInducks']`)
        .val(entrycodeParts[1])
        .closest("form")
        .trigger("submit");
    } else {
      pickOption("s", entrycodeParts[0]);
    }
  }
};

const handleAuto = (): void => {
  // TODO: Implement auto functionality
  console.log("Auto clicked");
};

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  countrycode.value = params.get("c") || undefined;
  magazinecode.value = params.get("s") || undefined;
  issuenumber.value = params.get("issNotInInducks") || undefined;
});
</script>

<style lang="scss" scoped>
$primary-color: #4caf50;
$primary-hover-color: #45a049;
$white: white;
$shadow-color: rgba(0, 0, 0, 0.1);
$border-color: #ddd;

.dumili-helper-app {
  .dumili-modal-trigger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: $primary-color;
    color: $white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 10000;

    &:hover {
      background-color: $primary-hover-color;
    }
  }

  .dumili-modal {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background-color: $white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px $shadow-color;
    z-index: 10000;
    min-width: 300px;

    &.hidden {
      visibility: hidden;
    }

    div[contenteditable] {
      font-family: monospace;
      white-space: pre;
      width: 100%;
      min-width: 200px;
      height: 100px;
      margin-bottom: 10px;
      border: 1px solid $border-color;
      border-radius: 4px;
    }

    button {
      width: 40%;
      padding: 8px;
      background-color: $primary-color;
      color: $white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:active {
        background-color: color.adjust($primary-color, $lightness: -10%);
        transform: translateY(1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
