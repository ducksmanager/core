import { defineStore } from "pinia";
import { useI18n } from "vue-i18n";

import { editingStep } from "~/stores/editingStep";
import { main } from "~/stores/main";
import { OptionNameAndValue } from "~/types/OptionNameAndValue";
import { OptionValue } from "~/types/OptionValue";

export interface StepOption {
  stepNumber: number;
  issuenumber: string;
  optionName: string;
  optionValue: OptionValue;
}
export type Options = StepOption[];

export type OptionsArray = OptionNameAndValue[];

export interface Dimensions {
  issuenumber: string;
  width: number;
  height: number;
}

export type DimensionsArray = Dimensions[];

export const optionObjectToArray = (
  optionObject: Record<string, OptionValue>
): OptionsArray =>
  Object.entries(optionObject).reduce<OptionsArray>(
    (acc, [optionName, optionValue]) => [...acc, { optionName, optionValue }],
    []
  );

const isColorOption = (optionName: string) =>
  optionName.toLowerCase().includes("color") ||
  ["fill", "stroke"].includes(optionName);

export const step = defineStore("step", () => {
  const options = ref([] as Options),
    dimensions = ref([] as DimensionsArray),
    colors = computed(() =>
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
    optionsPerStepNumber = computed(() =>
      options.value.reduce<Record<string, Options>>(
        (acc, { stepNumber, ...rest }) => ({
          ...acc,
          [stepNumber]: [...(acc[stepNumber] || []), { ...rest }],
        }),
        {}
      )
    ),
    getFilteredOptions = ({
      stepNumbers,
      issuenumbers,
    }: {
      stepNumbers?: number[];
      issuenumbers?: string[];
    }) => {
      return options.value.filter(
        ({ stepNumber, issuenumber }) =>
          (!stepNumbers || stepNumbers.includes(stepNumber)) &&
          (!issuenumbers || issuenumbers.includes(issuenumber))
      );
    },
    getFilteredDimensions = ({ issuenumbers }: { issuenumbers?: string[] }) =>
      dimensions.value.filter(
        ({ issuenumber }) => !issuenumbers || issuenumbers.includes(issuenumber)
      ),
    removeOptionValues = ({
      stepNumber: defaultStepNumber,
      issuenumbers: defaultIssuenumbers,
      optionNames,
    }: {
      stepNumber?: number;
      issuenumbers?: string[];
      optionNames?: string[];
    }) =>
      options.value.filter(
        ({ stepNumber, issuenumber, optionName }) =>
          defaultStepNumber !== stepNumber ||
          !defaultIssuenumbers?.includes(issuenumber) ||
          !optionNames?.includes(optionName)
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
      const newOptionsKeys = optionsAsArray.map(({ optionName }) => optionName);
      const defaultStepNumber =
        overrides.stepNumber === undefined
          ? editingStep().stepNumber
          : overrides.stepNumber;
      const defaultIssuenumbers =
        overrides.issuenumbers === undefined
          ? editingStep().issuenumbers
          : overrides.issuenumbers;

      const processedOptions: {
        stepNumber: number;
        issuenumber: string;
        optionName: string;
      }[] = [];
      options.value.forEach(({ stepNumber, issuenumber, optionName }, idx) => {
        if (
          stepNumber === defaultStepNumber &&
          defaultIssuenumbers.includes(issuenumber)
        ) {
          optionsAsArray.forEach(
            ({
              optionName: optionNameToUpdate,
              optionValue: optionValueToUpdate,
            }) => {
              if (optionName === optionNameToUpdate) {
                options.value[idx].optionValue = optionValueToUpdate;
                processedOptions.push({ stepNumber, issuenumber, optionName });
              }
            }
          );
        }
      });
      for (const issuenumberToProcess of defaultIssuenumbers) {
        for (const optionNameToProcess of newOptionsKeys) {
          if (
            !processedOptions.some(
              ({ stepNumber, issuenumber, optionName }) =>
                stepNumber === defaultStepNumber &&
                issuenumber === issuenumberToProcess &&
                optionName === optionNameToProcess
            )
          ) {
            options.value.push({
              stepNumber: defaultStepNumber,
              issuenumber: issuenumberToProcess,
              optionName: optionNameToProcess,
              optionValue: optionsAsArray.find(
                ({ optionName }) => optionName === optionNameToProcess
              )!.optionValue,
            });
          }
        }
      }
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
        ...(overrides.issuenumbers ?? main().issuenumbers).map(
          (issuenumber) => ({
            issuenumber,
            ...newDimensions,
          })
        ),
      ];
    },
    setSteps = (issuenumber: string, issueSteps: StepOption[]) => {
      checkSameComponentsAsCompletedEdge(issuenumber, issueSteps);
      // nextTick().then(() => {
      setOptionValues(issueSteps, {
        issuenumbers: [issuenumber],
      });
      // });
    },
    checkSameComponentsAsCompletedEdge = (
      issuenumber: string,
      issueSteps: StepOption[]
    ) => {
      let completedIssuenumber: string | null = null;
      for (
        let stepNumber = 0;
        stepNumber <= maxStepNumber.value;
        stepNumber++
      ) {
        const stepOptions = getFilteredOptions({
          stepNumbers: [stepNumber],
          issuenumbers: [issuenumber],
        });
        if (stepOptions.length) {
          completedIssuenumber = issuenumber;
        }
      }
      if (completedIssuenumber === null) {
        return;
      }
      const completedIssueSteps = getFilteredOptions({
        issuenumbers: [issuenumber],
      });

      const getComponents = (steps: StepOption[]) =>
        steps
          .filter(({ optionName }) => optionName === "component")
          .map(({ optionValue }) => optionValue)
          .join("+");
      const previousIssueComponents = getComponents(
        Object.values(completedIssueSteps)
      );
      const currentIssueComponents = getComponents(issueSteps);
      if (
        completedIssuenumber !== issuenumber &&
        previousIssueComponents !== currentIssueComponents
      ) {
        throw new Error(
          useI18n()
            .t(
              `Issue numbers {completedIssuenumber} and {issuenumber} ` +
                `don't have the same components` +
                `: {completedIssueSteps} vs {currentIssueComponents}`,
              {
                completedIssuenumber,
                issuenumber,
                previousIssueComponents,
                currentIssueComponents,
              }
            )
            .toString()
        );
      }
    },
    copyDimensionsAndSteps = (
      issuenumber: string,
      otherIssuenumber: string
    ) => {
      setDimensions(
        getFilteredDimensions({
          issuenumbers: [otherIssuenumber],
        }).map((dimension) => ({ ...dimension, issuenumber }))[0],
        {
          issuenumbers: [issuenumber],
        }
      );

      const steps = getFilteredOptions({
        issuenumbers: [issuenumber],
      });

      for (
        let stepNumber = 0;
        stepNumber <= maxStepNumber.value;
        stepNumber++
      ) {
        setOptionValues(
          steps
            .filter(
              ({ stepNumber: optionStepNumber }) =>
                optionStepNumber === stepNumber
            )
            .map((step) => ({ ...step, issuenumber: otherIssuenumber }))
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
          issuenumbers: main().issuenumbers,
          stepNumber: maxStepNumber.value + 1,
        }
      );
    },
    removeStep = (stepNumberToRemove: number) => {
      options.value = options.value.filter(
        ({ stepNumber }) => stepNumberToRemove !== stepNumber
      );
      for (
        let optionIndex = 0;
        optionIndex < options.value.length;
        optionIndex++
      ) {
        if (options.value[optionIndex].stepNumber > stepNumberToRemove) {
          options.value[optionIndex].stepNumber--;
        }
      }
    },
    duplicateStep = (stepNumber: number) => {
      const existingStepOptions = getFilteredOptions({
        stepNumbers: [stepNumber],
      });

      setOptionValues(
        existingStepOptions.map((option) => ({
          ...option,
          stepNumber: maxStepNumber.value + 1,
        }))
      );
    },
    swapSteps = (stepNumbers: [number, number]) => {
      for (
        let optionIndex = 0;
        optionIndex < options.value.length;
        optionIndex++
      ) {
        const stepNumber = options.value[optionIndex].stepNumber;
        if (stepNumbers.includes(stepNumber)) {
          options.value[optionIndex].stepNumber =
            stepNumbers[1 - stepNumbers.indexOf(stepNumber)];
        }
      }
      options.value.sort(
        ({ stepNumber: stepNumber1 }, { stepNumber: stepNumber2 }) =>
          Math.sign(stepNumber1 - stepNumber2)
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
    checkSameComponentsAsCompletedEdge,
    copyDimensionsAndSteps,
    addStep,
    removeStep,
    duplicateStep,
    swapSteps,
  };
});
