import { defineStore } from "pinia";

import { editingStep } from "~/stores/editingStep";
import { StepOptions } from "~/types/StepOptions";

export const globalEvent = defineStore("globalEvent", {
  state: () => ({
    options: {} as Record<
      number /* stepNumber*/,
      Record<string /* issuenumber */, StepOptions>
    >,
  }),
  actions: {
    setOptionValues(
      values: StepOptions,
      overrides: {
        issuenumbers?: string[];
        stepNumber?: number;
      } = { issuenumbers: undefined, stepNumber: undefined }
    ) {
      if (!this.options[editingStep().stepNumber]) {
        this.options[editingStep().stepNumber] = {};
      }
      for (const editingIssuenumber of overrides.issuenumbers ||
        editingStep().issuenumbers) {
        if (!this.options[editingStep().stepNumber][editingIssuenumber]) {
          this.options[editingStep().stepNumber][editingIssuenumber] = {};
        }
        for (const [optionName, optionValue] of Object.entries(values!)) {
          this.options[editingStep().stepNumber][editingIssuenumber]![
            optionName
          ] = optionValue;
        }
      }
    },
  },
});

watch(
  () => globalEvent().options,
  (newValue) => {
    console.log(JSON.parse(JSON.stringify(newValue)));
  }
);
