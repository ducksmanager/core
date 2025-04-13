import { defineStore } from "pinia";
import { useI18n } from "vue-i18n";

import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import type { OptionNameAndValue } from "~/types/OptionNameAndValue";
import type { OptionValue } from "~/types/OptionValue";

export interface StepOption {
  stepNumber: number;
  issuecode: string;
  optionName: string;
  optionValue: OptionValue;
}
export type Options = StepOption[];

export type OptionsArray = OptionNameAndValue[];

export interface Dimensions {
  issuecode: string;
  width: number;
  height: number;
}

export type DimensionsArray = Dimensions[];

export const optionObjectToArray = (
  optionObject: Record<string, OptionValue>,
): OptionsArray =>
  Object.entries(optionObject).reduce<OptionsArray>(
    (acc, [optionName, optionValue]) => [...acc, { optionName, optionValue }],
    [],
  );

const isColorOption = (optionName: string) =>
  optionName.toLowerCase().includes("color") ||
  ["fill", "stroke"].includes(optionName);

export const step = defineStore("step", () => {
  const options = ref<Options>([]),
    dimensions = ref<DimensionsArray>([]),
    colors = computed(() =>
      options.value.filter(
        ({ optionName, optionValue }) =>
          isColorOption(optionName) && optionValue !== "transparent",
      ),
    ),
    maxStepNumber = computed(() =>
      options.value.reduce(
        (max, { stepNumber }) => Math.max(max, stepNumber),
        -1,
      ),
    ),
    optionsPerStepNumber = computed(() =>
      options.value.groupBy("stepNumber", "[]"),
    ),
    getFilteredOptions = ({
      stepNumbers,
      issuecodes,
    }: {
      stepNumbers?: number[];
      issuecodes?: string[];
    }) =>
      options.value.filter(
        ({ stepNumber, issuecode }) =>
          (!stepNumbers || stepNumbers.includes(stepNumber)) &&
          (!issuecodes || issuecodes.includes(issuecode)),
      ),
    getFilteredDimensions = ({ issuecodes }: { issuecodes?: string[] }) =>
      dimensions.value.filter(
        ({ issuecode }) => !issuecodes || issuecodes.includes(issuecode),
      ),
    removeOptionValues = ({
      stepNumber: defaultStepNumber,
      issuecodes: defaultIssuecodes,
      optionNames,
    }: {
      stepNumber?: number;
      issuecodes?: string[];
      optionNames?: string[];
    }) =>
      options.value.filter(
        ({ stepNumber, issuecode, optionName }) =>
          defaultStepNumber !== stepNumber ||
          !defaultIssuecodes?.includes(issuecode) ||
          !optionNames?.includes(optionName),
      ),
    setOptionValues = (
      newOptions: OptionsArray | Record<string, OptionValue>,
      overrides: {
        issuecodes?: string[];
        stepNumber?: number;
      } = { issuecodes: undefined, stepNumber: undefined },
    ) => {
      const optionsAsArray = newOptions.hasOwnProperty("length")
        ? (newOptions as OptionsArray)
        : optionObjectToArray(newOptions as Record<string, OptionValue>);
      const newOptionsKeys = optionsAsArray.map(({ optionName }) => optionName);
      const defaultStepNumber =
        overrides.stepNumber === undefined
          ? editingStep().stepNumber
          : overrides.stepNumber;
      const defaultIssuecodes =
        overrides.issuecodes === undefined
          ? editingStep().issuecodes
          : overrides.issuecodes;

      const processedOptions = options.value.flatMap(
        ({ stepNumber, issuecode, optionName }, idx) => {
          if (
            stepNumber === defaultStepNumber &&
            defaultIssuecodes.includes(issuecode)
          ) {
            for (const {
              optionName: optionNameToUpdate,
              optionValue: optionValueToUpdate,
            } of optionsAsArray) {
              if (optionName === optionNameToUpdate) {
                options.value[idx].optionValue = optionValueToUpdate;
                return { stepNumber, issuecode, optionName };
              }
            }
          }
          return [];
        },
      );
      for (const issuecodeToProcess of defaultIssuecodes) {
        for (const optionNameToProcess of newOptionsKeys) {
          if (
            !processedOptions.some(
              ({ stepNumber, issuecode, optionName }) =>
                stepNumber === defaultStepNumber &&
                issuecode === issuecodeToProcess &&
                optionName === optionNameToProcess,
            )
          ) {
            options.value.push({
              stepNumber: defaultStepNumber,
              issuecode: issuecodeToProcess,
              optionName: optionNameToProcess,
              optionValue: optionsAsArray.find(
                ({ optionName }) => optionName === optionNameToProcess,
              )!.optionValue,
            });
          }
        }
      }
    },
    setDimensions = (
      newDimensions: { width: number; height: number },
      overrides: {
        issuecodes?: string[];
      },
    ) => {
      dimensions.value = [
        ...dimensions.value.filter(
          ({ issuecode }) =>
            overrides.issuecodes && !overrides.issuecodes.includes(issuecode),
        ),
        ...(overrides.issuecodes ?? main().issuecodes).map((issuecode) => ({
          issuecode,
          ...newDimensions,
        })),
      ];
    },
    setSteps = (issuecode: string, stepOptions: StepOption[]) => {
      checkSameComponentsAsFirstEdge(issuecode, stepOptions);
      for (const stepOption of stepOptions) {
        options.value.push(stepOption);
      }
    },
    checkSameComponentsAsFirstEdge = (
      issuecode: string,
      issueSteps: StepOption[],
    ) => {
      const firstIssuecode = main().issuecodes[0];
      if (firstIssuecode === issuecode) {
        return;
      }
      const firstIssueSteps = getFilteredOptions({
        issuecodes: [firstIssuecode],
      });

      const getComponents = (steps: StepOption[]) =>
        steps
          .filter(({ optionName }) => optionName === "component")
          .map(({ optionValue }) => optionValue)
          .join("+");

      const firstIssueComponents = getComponents(
        Object.values(firstIssueSteps),
      );
      const currentIssueComponents = getComponents(issueSteps);
      if (firstIssueComponents !== currentIssueComponents) {
        throw new Error(
          useI18n()
            .t(
              `Issue codes {firstIssuecode} and {issuecode} ` +
                `don't have the same components` +
                `: {firstIssueComponents} vs {currentIssueComponents}`,
              {
                firstIssuecode: firstIssuecode,
                issuecode,
                firstIssueComponents,
                currentIssueComponents,
              },
            )
            .toString(),
        );
      }
    },
    addStep = (component: string) => {
      setOptionValues(
        [
          {
            optionName: "component",
            optionValue: component,
          },
        ],
        {
          issuecodes: main().issuecodes,
          stepNumber: maxStepNumber.value + 1,
        },
      );
    },
    removeStep = (stepNumberToRemove: number) => {
      options.value = options.value.filter(
        ({ stepNumber }) => stepNumberToRemove !== stepNumber,
      );

      for (const option of options.value) {
        if (option.stepNumber > stepNumberToRemove) {
          option.stepNumber--;
        }
      }
    },
    duplicateStep = (stepNumber: number) => {
      const existingStepOptions = getFilteredOptions({
        stepNumbers: [stepNumber],
      });

      setOptionValues(existingStepOptions, {
        stepNumber: maxStepNumber.value + 1,
      });
    },
    swapSteps = (stepNumbers: [number, number]) => {
      for (const option of options.value) {
        const stepNumber = option.stepNumber;
        if (stepNumbers.includes(stepNumber)) {
          option.stepNumber = stepNumbers[1 - stepNumbers.indexOf(stepNumber)];
        }
      }
      options.value.sort(
        ({ stepNumber: stepNumber1 }, { stepNumber: stepNumber2 }) =>
          Math.sign(stepNumber1 - stepNumber2),
      );
    };
  return {
    options,
    dimensions,
    colors,
    optionsPerStepNumber,
    maxStepNumber,
    getFilteredOptions,
    getFilteredDimensions,
    setOptionValues,
    removeOptionValues,
    setDimensions,
    setSteps,
    checkSameComponentsAsCompletedEdge: checkSameComponentsAsFirstEdge,
    addStep,
    removeStep,
    duplicateStep,
    swapSteps,
  };
});
