export type ModelSteps = {
  [issuecode: string]: {
    [stepNumber: string]: {
      issuecode: string;
      stepNumber: number;
      functionName: string;
      options: { [optionName: string]: string };
    };
  };
};
