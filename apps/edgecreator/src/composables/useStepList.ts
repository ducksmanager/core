import { useI18n } from "vue-i18n";

import { step, StepOption } from "~/stores/step";

const stepStore = step();
const steps = computed(() => stepStore.options);
export default () => {
  const checkSameComponentsAsCompletedEdge = (
    issuenumber: string,
    issueSteps: StepOption[]
  ) => {
    let completedIssuenumber: string | null = null;
    for (
      let stepNumber = 0;
      stepNumber <= stepStore.maxStepNumber;
      stepNumber++
    ) {
      const stepOptions = stepStore.getFilteredOptions({
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
    const completedIssueSteps = stepStore.getFilteredOptions({
      issuenumbers: [issuenumber],
    });

    const getComponents = (steps: StepOption[]) =>
      steps
        ?.filter(({ optionName }) => optionName === "component")
        .map(({ optionValue }) => optionValue)
        .join("+");
    const previousIssueComponents = getComponents(
      Object.values(completedIssueSteps)
    );
    const currentIssueComponents = getComponents(issueSteps);
    if (
      completedIssuenumber !== issuenumber &&
      completedIssueSteps &&
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
  };

  const setSteps = (issuenumber: string, issueSteps: StepOption[]) => {
    checkSameComponentsAsCompletedEdge(issuenumber, issueSteps);
    nextTick().then(() => {
      stepStore.setOptionValues(issueSteps, {
        issuenumbers: [issuenumber],
      });
    });
  };

  const copyDimensionsAndSteps = (
    issuenumber: string,
    otherIssuenumber: string
  ) => {
    stepStore.setDimensions(
      stepStore.getFilteredDimensions({
        issuenumbers: [otherIssuenumber],
      })[0],
      {
        issuenumbers: [issuenumber],
      }
    );

    const steps = stepStore.getFilteredOptions({
      issuenumbers: [issuenumber],
    });

    for (
      let stepNumber = 0;
      stepNumber <= stepStore.maxStepNumber;
      stepNumber++
    ) {
      stepStore.setOptionValues(
        steps
          .filter(
            ({ stepNumber: optionStepNumber }) =>
              optionStepNumber === stepNumber
          )
          .map((step) => ({ ...step, issuenumber: otherIssuenumber }))
      );
    }
  };

  const addStep = (component: string) => {
    stepStore.setOptionValues(
      [
        {
          optionName: "component",
          optionValue: component,
        },
      ],
      {
        stepNumber: (stepStore.maxStepNumber || -1) + 1,
      }
    );
  };

  const removeStep = (stepNumber: number) => {
    stepStore.removeOptionValues({
      stepNumber,
    });
  };

  const duplicateStep = (stepNumber: number) => {
    const existingStepOptions = stepStore.getFilteredOptions({
      stepNumbers: [stepNumber],
    });

    stepStore.setOptionValues(
      existingStepOptions.map((option) => ({
        ...option,
        stepNumber: stepStore.maxStepNumber + 1,
      }))
    );
  };

  const swapSteps = (stepNumbers: [number, number]) => {
    const issueSteps = steps.value;
    const stepsToSwap = [
      issueSteps[stepNumbers[0]],
      issueSteps[stepNumbers[1]],
    ];
    steps.value[stepNumbers[0]] = stepsToSwap[1];
    steps.value[stepNumbers[1]] = stepsToSwap[0];
  };

  return {
    steps,
    checkSameComponentsAsCompletedEdge,
    setSteps,
    copyDimensionsAndSteps,
    addStep,
    removeStep,
    duplicateStep,
    swapSteps,
  };
};
