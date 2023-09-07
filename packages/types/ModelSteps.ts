export type ModelSteps = {
  [issuenumber: string]: {
    [stepNumber: string]: {
      issuenumber: string;
      stepNumber: number;
      functionName: string;
      options: { [optionName: string]: string };
    };
  };
};
