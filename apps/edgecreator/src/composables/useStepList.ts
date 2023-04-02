import { editingStep } from "~/stores/editingStep";
import { globalEvent } from "~/stores/globalEvent";
import { Step } from "~/types/Step";
import { StepsPerIssuenumber } from "~/types/StepsPerIssuenumber";

const { dimensions } = useDimensions();
const steps = ref({} as StepsPerIssuenumber);
export default () => {
  watch(
    () => globalEvent().options,
    (changes) => {
      const { issuenumbers, stepNumber, ...optionChanges } = { ...changes };
      const targetIssueNumbers = issuenumbers || editingStep().issuenumbers;
      const targetStepNumber =
        stepNumber !== undefined ? stepNumber : editingStep().stepNumber;
      for (const issuenumber of Object.keys(steps.value).filter((issuenumber) =>
        targetIssueNumbers.includes(issuenumber)
      )) {
        const step = steps.value[issuenumber][targetStepNumber];
        step.options = {
          ...(step.options || {}),
          ...optionChanges,
        };
      }
    }
  );

  const checkSameComponentsAsCompletedEdge = (
    issuenumber: string,
    issueSteps: Step[]
  ) => {
    const completedIssuenumber = Object.keys(steps.value).find(
      (issueNumber) => steps.value[issueNumber].length
    )!;
    const completedIssueSteps = steps.value[completedIssuenumber];
    const getComponents = (steps: Step[]) =>
      steps?.map(({ component }) => component).join("+");
    const previousIssueComponents = getComponents(completedIssueSteps);
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
      steps.value[issuenumber] = issueSteps;
    });
  };

  const copyDimensionsAndSteps = (
    issuenumber: string,
    otherIssuenumber: string
  ) => {
    dimensions.value[issuenumber] = JSON.parse(
      JSON.stringify(dimensions.value[otherIssuenumber])
    );

    steps.value[issuenumber] = JSON.parse(
      JSON.stringify(steps.value[otherIssuenumber])
    );
  };

  const addStep = (component: string) => {
    for (const issuenumber of Object.keys(steps.value)) {
      steps.value[issuenumber].push({
        component,
      });
    }
  };

  const removeStep = (stepNumber: number) => {
    for (const issuenumber of Object.keys(steps.value)) {
      steps.value[issuenumber].splice(stepNumber, 1);
    }
  };

  const duplicateStep = (stepNumber: number) => {
    for (const issuenumber of Object.keys(steps.value)) {
      const existingStep = steps.value[issuenumber][stepNumber];
      steps.value[issuenumber].splice(stepNumber, 0, {
        component: existingStep.component,
        options: { ...existingStep.options },
      });
    }
  };

  const swapSteps = (stepNumbers: number[]) => {
    for (const issuenumber of Object.keys(steps.value)) {
      const issueSteps = steps.value[issuenumber];
      const stepsToSwap = [
        issueSteps[stepNumbers[0]],
        issueSteps[stepNumbers[1]],
      ];
      steps.value[issuenumber].splice(
        stepNumbers[0],
        2,
        stepsToSwap[1],
        stepsToSwap[0]
      );
    }
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
