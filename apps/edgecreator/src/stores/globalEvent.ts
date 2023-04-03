import { defineStore } from "pinia";

import { editingStep } from "~/stores/editingStep";
import { OptionValue } from "~/types/OptionValue";
import { StepOptions } from "~/types/StepOptions";

export type Options = Record<
  number /* stepNumber */,
  {
    component: string;
    options?: {
      [optionName: string]: Record<string /* issuenumber */, OptionValue>;
    };
  }
>;

const isColorOption = (optionName: string) =>
  optionName.toLowerCase().includes("color") ||
  ["fill", "stroke"].includes(optionName);

export const globalEvent = defineStore("globalEvent", {
  state: () => ({
    options: {} as Options,
  }),
  getters: {
    stepColors() {
      const options = this.options;
      const colorsByIssuenumber: Record<string, string[]> = {};
      for (const { options: stepOptions } of Object.values(options)) {
        for (const [optionName, optionValues] of Object.entries(
          stepOptions || {}
        )) {
          if (isColorOption(optionName)) {
            for (const [issuenumber, optionValue] of Object.entries(
              optionValues
            )) {
              if (optionValue !== "transparent") {
                if (!colorsByIssuenumber[issuenumber]) {
                  colorsByIssuenumber[issuenumber] = [];
                }
                colorsByIssuenumber[issuenumber].push(optionValue as string);
              }
            }
          }
        }
      }
      return colorsByIssuenumber;
    },
  },
  actions: {
    getFilteredOptions({
      stepNumbers,
      issuenumbers,
    }: {
      stepNumbers?: number[];
      issuenumbers?: string[];
    }): typeof this.options {
      return Object.entries(this.options)
        .filter(
          ([stepNumber]) =>
            !stepNumbers || stepNumbers.includes(parseInt(stepNumber))
        )
        .reduce(
          (acc, [stepNumber, { component, options: stepOptions }]) => ({
            ...acc,
            [stepNumber]: {
              component,
              options: Object.entries(stepOptions || {})
                .filter(
                  ([issuenumber]) =>
                    !issuenumbers || issuenumbers.includes(issuenumber)
                )
                .reduce(
                  (acc2, issueOptionsForStep, issuenumber) => ({
                    ...acc2,
                    [issuenumber]: issueOptionsForStep,
                  }),
                  {}
                ),
            },
          }),
          {}
        );
    },
    setOptionValues(
      {
        component,
        options,
      }: {
        component?: string;
        options: StepOptions;
      },
      overrides: {
        issuenumbers?: string[];
        stepNumber?: number;
      } = { issuenumbers: undefined, stepNumber: undefined }
    ) {
      const stepNumber =
        overrides.stepNumber === undefined
          ? editingStep().stepNumber
          : overrides.stepNumber;
      if (!this.options[stepNumber]) {
        if (!component) {
          console.error("component should be set for new steps");
          return;
        }
        this.options[stepNumber] = {
          component,
        };
      }
      if (!this.options[stepNumber].options) {
        this.options[stepNumber].options = {};
      }
      for (const [optionName, optionValue] of Object.entries(options!)) {
        if (!this.options[stepNumber].options![optionName]) {
          this.options[stepNumber].options![optionName] = {};
        }
        for (const editingIssuenumber of overrides.issuenumbers ||
          editingStep().issuenumbers) {
          this.options[stepNumber].options![optionName][editingIssuenumber] =
            optionValue;
        }
      }
    },
  },
});
