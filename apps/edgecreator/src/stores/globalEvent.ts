import { defineStore } from "pinia";

import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import { OptionNameAndValue } from "~/types/OptionNameAndValue";
import { OptionValue } from "~/types/OptionValue";

export type StepOption = {
  stepNumber: number;
  issuenumber: string;
  optionName: string;
  optionValue: OptionValue;
};
export type Options = StepOption[];

export type OptionsArray = OptionNameAndValue[];

export type Dimensions = {
  issuenumber: string;
  width: number;
  height: number;
};

export type DimensionsArray = Dimensions[];

export const optionObjectToArray = (
  optionObject: Record<string, OptionValue>
): OptionsArray =>
  Object.entries(optionObject).reduce(
    (acc, [optionName, optionValue]) => [...acc, { optionName, optionValue }],
    [] as OptionsArray
  );

const isColorOption = (optionName: string) =>
  optionName.toLowerCase().includes("color") ||
  ["fill", "stroke"].includes(optionName);

export const globalEvent = defineStore("globalEvent", () => {
  const options = ref([] as Options),
    dimensions = ref([] as DimensionsArray),
    stepColors = computed(() =>
      options.value.filter(
        ({ optionName, optionValue }) =>
          isColorOption(optionName) && optionValue !== "transparent"
      )
    ),
    maxStepNumber = computed(() =>
      options.value.reduce(
        (max, { stepNumber }) => Math.max(max, stepNumber),
        -1
      )
    ),
    getFilteredOptions = ({
      stepNumbers,
      issuenumbers,
    }: {
      stepNumbers?: number[];
      issuenumbers?: string[];
    }) =>
      options.value.filter(
        ({ stepNumber, issuenumber }) =>
          (!stepNumbers || stepNumbers.includes(stepNumber)) &&
          (!issuenumbers || issuenumbers.includes(issuenumber))
      ),
    getFilteredDimensions = ({ issuenumbers }: { issuenumbers?: string[] }) =>
      dimensions.value.filter(
        ({ issuenumber }) => !issuenumbers || issuenumbers.includes(issuenumber)
      ),
    removeOptionValues = ({
      stepNumber: defaultStepNumber,
      issuenumbers: defaultIssuenumbers,
    }: {
      stepNumber?: number;
      issuenumbers?: string[];
    }) =>
      options.value.filter(
        ({ stepNumber, issuenumber, optionName }) =>
          optionName === "component" ||
          !(
            (!defaultStepNumber || defaultStepNumber === stepNumber) &&
            (!defaultIssuenumbers || defaultIssuenumbers.includes(issuenumber))
          )
      ),
    setOptionValues = (
      newOptions: OptionsArray | Record<string, OptionValue>,
      overrides: {
        issuenumbers?: string[];
        stepNumber?: number;
      } = { issuenumbers: undefined, stepNumber: undefined }
    ) => {
      const optionsAsArray = newOptions.hasOwnProperty("length")
        ? (newOptions as OptionsArray)
        : optionObjectToArray(newOptions as Record<string, OptionValue>);
      const defaultStepNumber =
        overrides.stepNumber === undefined
          ? editingStep().stepNumber
          : overrides.stepNumber;
      const defaultIssuenumbers =
        overrides.issuenumbers === undefined
          ? editingStep().issuenumbers
          : overrides.issuenumbers;
      options.value = [
        ...removeOptionValues({
          stepNumber: defaultStepNumber,
          issuenumbers: defaultIssuenumbers,
        }),
        ...defaultIssuenumbers.reduce(
          (acc, issuenumber) => [
            ...acc,
            ...optionsAsArray.map(({ optionName, optionValue }) => ({
              stepNumber: defaultStepNumber,
              issuenumber,
              optionName,
              optionValue,
            })),
          ],
          [] as StepOption[]
        ),
      ];
    },
    setDimensions = (
      newDimensions: { width: number; height: number },
      overrides: {
        issuenumbers?: string[];
      }
    ) => {
      dimensions.value = [
        ...dimensions.value.filter(
          ({ issuenumber }) =>
            overrides.issuenumbers &&
            !overrides.issuenumbers.includes(issuenumber)
        ),
        ...(overrides.issuenumbers || main().issuenumbers).map(
          (issuenumber) => ({
            issuenumber,
            ...newDimensions,
          })
        ),
      ];
    };
  return {
    options,
    dimensions,
    stepColors,
    maxStepNumber,
    getFilteredOptions,
    getFilteredDimensions,
    setOptionValues,
    removeOptionValues,
    setDimensions,
  };
});
