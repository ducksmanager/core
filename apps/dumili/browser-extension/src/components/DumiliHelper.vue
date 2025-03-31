<template>
  <div class="dumili-helper-app">
    <button class="dumili-modal-trigger" @click="isModalVisible = !isModalVisible">
      Dumili helper
    </button>
    <div class="dumili-modal" :class="{ hidden: !isModalVisible }">
      <div v-if="context.countrycode || context.isEditingIssue || context.entryId">
        <div id="dumili-editor">
          <div v-if="content" id="current-row">→</div>
          <div id="dumili-output" :contenteditable="!content" placeholder="Enter Dumili text output" v-text="content"
            @input="content = ($event.target as HTMLDivElement).innerText">
          </div>
        </div>
        <div style="display: flex; justify-content: space-between">
          <template v-if="sessionData.dumiliOutput.length && sessionData.currentRow !== -1"><button @click="handleNext">&gt; Next</button>
          <button @click="handleAuto">ϟ Auto</button></template>
          <button id="reset" @click="content = ''">↻ Reset</button>
        </div>
      </div>
      <div v-else>Click on "index a new issue" and select a country</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import $ from "jquery";
import useTextEditor, { DumiliEntryData, DumiliIssueData, DumiliOutput } from "~dumili/src/composables/useTextEditor";

interface SelectOption {
  value: string;
  text: string;
}

const dumiliOutputLineHeight = 24;

type DumiliContext = {
  countrycode?: string;
  magazinecode?: string;
  issuenumber?: string;
  isEditingIssue?: boolean;
  hasEditedIssueDetails?: boolean;
  entryId?: string;
}

const isModalVisible = ref(true);
const context = ref<DumiliContext>({});

const sessionData = ref<{ dumiliOutput: DumiliOutput, currentRow: number, auto: boolean }>({ dumiliOutput: [], currentRow: 0, auto: false });

const content = ref('');
/* Example:
DVBH 56     h3 [inx:Bruno Perel] [pages:116]
DVBH 56a                  1  c                          
DVBH 56p002 D 97006       9  3                          
DVBH 56p011 D 96163       11 3                          
DVBH 56p022               12 3                          
DVBH 56p033               1  3                          
DVBH 56p034               1  i                          */
const persistDumiliData = (): void => {
  sessionStorage.setItem("dumiliData", JSON.stringify(sessionData.value));
};

const restoreDumiliData = (): void => {
  if (sessionStorage.getItem("dumiliData")) {
    sessionData.value = JSON.parse(sessionStorage.getItem("dumiliData")!)
  }
};

restoreDumiliData();
if (sessionData.value.dumiliOutput.length && sessionData.value.currentRow >= sessionData.value.dumiliOutput.length) {
  sessionStorage.clear()
  sessionData.value = { dumiliOutput: [], currentRow: 0, auto: false }
  alert('All the entries have been created. Review them and then click on "Submit to Inducks".')
}

watch(content, (newContent, oldContent) => {
  if (!oldContent && sessionData.value.dumiliOutput.length) {
    return; // Let the content be set by the session data
  }
  const { unText } = useTextEditor();
  const dumiliOutput = unText(newContent.trim());
  if (newContent.trim() && dumiliOutput.length <= 2) {
    content.value = ''
    nextTick(() => {
      alert('Invalid Dumili text output');
    });
  }
  else {
    sessionData.value = { currentRow: 0, dumiliOutput, auto: false }
    persistDumiliData();
  }

  console.log("sessionStorageData", sessionData.value);
}, { immediate: true });

const pickOption = (select: JQuery<HTMLSelectElement>, optionValue: string) => {
  const selectElement = select[0];
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
        `Option with value ${optionValue} in dropdown ${select.attr('name')} not found`
      );
    }
  } else {
    window.alert(`Dropdown with name ${select.attr('name')} not found`);
  }
};

const fillFormFields = <Data extends DumiliEntryData | DumiliIssueData>(data: Partial<Data>, defaultInputToSubmitFrom?: string & (keyof Data | 'npages') | undefined, incrementCurrentRow = true): void => {
  let lastFilledInput = $();
  for (const [key, value] of Object.entries(data)) {
    const input = $(`[name='${key}']`);
    if (input.length) {
      lastFilledInput = input;
      input.val(value as string);
    }
  }

  if (!lastFilledInput.length && defaultInputToSubmitFrom) {
    lastFilledInput = $(`[name='${defaultInputToSubmitFrom}']`);
  }
  if (lastFilledInput.length) {
    if (incrementCurrentRow) {
      sessionData.value.currentRow++;
    }
    nextTick(() => {
      persistDumiliData();
      lastFilledInput!.closest("form")
        .trigger("submit");
    });
  } else if (!defaultInputToSubmitFrom) {
    alert(`No field match in the form, data: ${JSON.stringify(data)}`)
  }
};

const handleNext = () => {
  if (sessionData.value.dumiliOutput[0]) {
    const ctx = context.value;
    const issuecodeNoCountry = sessionData.value.dumiliOutput[0].issNotInInducks;
    const issuecodeNoCountryParts = issuecodeNoCountry?.split(" ");
    if (issuecodeNoCountryParts?.length !== 2) {
      window.alert(`Invalid issue code format: ${issuecodeNoCountry}`);
      return;
    }

    if (ctx.entryId !== undefined) {
      // "Edit entry" page
      fillFormFields(sessionData.value.dumiliOutput[sessionData.value.currentRow] as DumiliEntryData);
    }
    else if (ctx.hasEditedIssueDetails) {
      $(`a:contains("Edit entries")`)[0]?.click()
    }
    else if (ctx.isEditingIssue) {
      const createNewEntryButton = $(`a:contains("a new entry")`)[0];
      if (createNewEntryButton) {
        createNewEntryButton.click();
      }
      else {
        fillFormFields(sessionData.value.dumiliOutput[0], 'npages');
      }
    }
    // "Issues being indexed" page
    else if (ctx.issuenumber !== undefined) {
      $("td")
        .filter((_, el) => $(el).text().trim() === "unfinished")
        .eq(0)
        .next()
        .find("a")[0]
        .click();
    }
    // "Add issue" page
    else if (ctx.magazinecode) {
      fillFormFields({
        issNotInInducks: issuecodeNoCountryParts[1],
      },
        undefined,
        false);
    } else if (ctx.countrycode) {
      pickOption($('select[name="s"]'), issuecodeNoCountryParts[0]);
    }
    else {
      alert('Nothing to do!')
    }
  }
};

const handleAuto = (): void => {
  sessionData.value.auto = true;
  persistDumiliData();
  handleNext();
};

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  context.value = {
    countrycode: params.get("c") || undefined,
    magazinecode: params.get("s") || undefined,
    issuenumber: params.get("issNotInInducks") || undefined,
    isEditingIssue: params.get("editissue") !== null || $('a:contains("a new entry")').length > 0,
    hasEditedIssueDetails: $('body').text().includes('Succesfully updated'),
    entryId: params.get("identry") || undefined
  };

  console.log("context", context.value);

  if (sessionData.value.auto) {
    handleNext();
  }
});
</script>

<style lang="scss" scoped>
$primary-color: #4caf50;
$primary-hover-color: #45a049;
$danger-color: #f44336;
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

    #dumili-editor {
      position: relative;
      height: max-content;
      max-height: 50vh;

      overflow-y: auto;

      #current-row {
        position: absolute;
        top: v-bind('sessionData.currentRow * dumiliOutputLineHeight + "px"');
        left: 0;
        width: 16px;
        height: v-bind('dumiliOutputLineHeight + "px"');
        padding: 0 4px;
        font-size: v-bind('dumiliOutputLineHeight * .8 + "px"');
        text-align: center;
        background-color: black;
        color: $white;
      }

      #dumili-output {
        font-family: monospace;
        white-space: pre;
        width: calc(100% - 32px);
        margin-bottom: 10px;
        padding: 0 8px 0 24px;
        line-height: v-bind('dumiliOutputLineHeight + "px"');
        border: 1px solid $border-color;
        border-radius: 4px;
      }
    }

    button {
      $button-color: $primary-color;
      width: 35%;
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

      &[id="reset"] {
        width: 20%;
        background-color: $danger-color;

        &:active {
          background-color: color.adjust($danger-color, $lightness: -10%);
        }
      }
    }
  }
}
</style>
