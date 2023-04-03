import { globalEvent } from "~/stores/globalEvent";
import { Step } from "~/types/Step";

const { dimensions } = useDimensions();
const globalEventStore = globalEvent();
const steps = computed(() => globalEventStore.options);
export default () => {
  // watch(
  //   () => globalEvent().options,
  //   (changes) => {
  //     const { issuenumbers, stepNumber, ...optionChanges } = { ...changes };
  //     const targetIssueNumbers = issuenumbers || editingStep().issuenumbers;
  //     const targetStepNumber =
  //       stepNumber !== undefined ? stepNumber : editingStep().stepNumber;
  //     for (const issuenumber of Object.keys(steps.value).filter((issuenumber) =>
  //       targetIssueNumbers.includes(issuenumber)
  //     )) {
  //       const step = steps.value[issuenumber][targetStepNumber];
  //       step.options = {
  //         ...(step.options || {}),
  //         ...optionChanges,
  //       };
  //     }
  //   }
  // );

  const checkSameComponentsAsCompletedEdge = (
    issuenumber: string,
    issueSteps: Step[]
  ) => {
    let completedIssuenumber: string | null = null;
    for (const stepNumber of Object.keys(steps.value)) {
      const stepOptions = steps.value[parseInt(stepNumber)].options;
      for (const issuenumber of Object.keys(stepOptions || {})) {
        if (Object.values(stepOptions![issuenumber]).length) {
          completedIssuenumber = issuenumber;
          break;
        }
      }
    }
    if (completedIssuenumber === null) {
      return;
    }
    const completedIssueSteps = Object.values(steps.value).map((step) => ({
      component: step.component,
      options: step.options![completedIssuenumber as string],
    }));
    const getComponents = (steps: Step[]) =>
      steps?.map(({ component }) => component).join("+");
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
        // i18n
        //   .t(
        `Issue numbers {completedIssuenumber} and {issuenumber} ` +
          `don't have the same components` +
          `: {completedIssueSteps} vs {currentIssueComponents}`
        //   {
        //     completedIssuenumber,
        //     issuenumber,
        //     previousIssueComponents,
        //     currentIssueComponents,
        //   }
        // )
        // .toString()
      );
    }
  };

  const setSteps = (issuenumber: string, issueSteps: Step[]) => {
    checkSameComponentsAsCompletedEdge(issuenumber, issueSteps);
    nextTick().then(() => {
      issueSteps.forEach((value, stepNumber) => {
        steps.value[stepNumber].options![issuenumber] =
          issueSteps[stepNumber].options!;
      });
    });
  };

  const copyDimensionsAndSteps = (
    issuenumber: string,
    otherIssuenumber: string
  ) => {
    dimensions.value[issuenumber] = JSON.parse(
      JSON.stringify(dimensions.value[otherIssuenumber])
    );

    for (const stepNumber of Object.keys(steps.value)) {
      steps.value[parseInt(stepNumber)].options![issuenumber] = JSON.parse(
        JSON.stringify(
          steps.value[parseInt(stepNumber)].options![otherIssuenumber]
        )
      );
    }
  };

  const addStep = (component: string) => {
    steps.value[Object.keys(steps.value).length] = {
      component,
    };
  };

  const removeStep = (stepNumber: number) => {
    delete steps.value[stepNumber];
  };

  const duplicateStep = (stepNumber: number) => {
    const newStepNumber = parseInt(
      Object.keys(steps.value)[Object.keys(steps.value).length - 1] + 1
    );
    const existingStep = steps.value[stepNumber];
    steps.value[newStepNumber] = {
      component: existingStep.component,
      options: { ...existingStep.options },
    };
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
