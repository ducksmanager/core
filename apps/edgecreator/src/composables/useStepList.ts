import { useI18n } from "vue-i18n";

import { globalEvent, StepOption } from "~/stores/globalEvent";

const globalEventStore = globalEvent();
const steps = computed(() => globalEventStore.options);
export default () => {
  const checkSameComponentsAsCompletedEdge = (
    issuenumber: string,
    issueSteps: StepOption[]
  ) => {
    let completedIssuenumber: string | null = null;
    for (
      let stepNumber = 0;
      stepNumber <= globalEventStore.maxStepNumber;
      stepNumber++
    ) {
      const stepOptions = globalEventStore.getFilteredOptions({
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
    const completedIssueSteps = globalEventStore.getFilteredOptions({
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
      globalEventStore.setOptionValues(issueSteps, {
        issuenumbers: [issuenumber],
      });
    });
  };

  const copyDimensionsAndSteps = (
    issuenumber: string,
    otherIssuenumber: string
  ) => {
    globalEventStore.setDimensions(
      globalEventStore.getFilteredDimensions({
        issuenumbers: [otherIssuenumber],
      })[0],
      {
        issuenumbers: [issuenumber],
      }
    );

    const steps = globalEventStore.getFilteredOptions({
      issuenumbers: [issuenumber],
    });

    for (
      let stepNumber = 0;
      stepNumber <= globalEventStore.maxStepNumber;
      stepNumber++
    ) {
      globalEventStore.setOptionValues(
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
    globalEventStore.setOptionValues(
      [
        {
          optionName: "component",
          optionValue: component,
        },
      ],
      {
        stepNumber: (globalEventStore.maxStepNumber || -1) + 1,
      }
    );
  };

  const removeStep = (stepNumber: number) => {
    globalEventStore.removeOptionValues({
      stepNumber,
    });
  };

  const duplicateStep = (stepNumber: number) => {
    const existingStepOptions = globalEventStore.getFilteredOptions({
      stepNumbers: [stepNumber],
    });

    globalEventStore.setOptionValues(
      existingStepOptions.map((option) => ({
        ...option,
        stepNumber: globalEventStore.maxStepNumber + 1,
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
