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
      console.trace(newOptions);
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
      console.log(defaultStepNumber);
      console.log(defaultIssuenumbers);
      options.value = [
        ...new Set(
          [
            ...removeOptionValues({
              stepNumber: defaultStepNumber,
              issuenumbers: defaultIssuenumbers,
              optionNames: optionsAsArray.map(({ optionName }) => optionName),
            }),
            ...defaultIssuenumbers.reduce<StepOption[]>(
              (acc, issuenumber) => [
                ...acc,
                ...optionsAsArray.map(({ optionName, optionValue }) => ({
                  stepNumber: defaultStepNumber,
                  issuenumber,
                  optionName,
                  optionValue,
                })),
              ],
              []
            ),
          ].map((option) => JSON.stringify(option))
        ),
      ].map((option) => JSON.parse(option) as StepOption);
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
    removeStep = (stepNumber: number) => {
      removeOptionValues({
        stepNumber,
      });
    },
    duplicateStep = (stepNumber: number) => {
      const existingStepOptions = getFilteredOptions({
        stepNumbers: [stepNumber],
      });
      debugger;

      setOptionValues(
        existingStepOptions.map((option) => ({
          ...option,
          stepNumber: maxStepNumber.value + 1,
        }))
      );
    },
    swapSteps = (stepNumbers: [number, number]) => {
      const stepsToSwap = [
        options.value[stepNumbers[0]],
        options.value[stepNumbers[1]],
      ];
      options.value[stepNumbers[0]] = stepsToSwap[1];
      options.value[stepNumbers[1]] = stepsToSwap[0];
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
