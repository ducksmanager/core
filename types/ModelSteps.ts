export type ModelSteps = {
  [issuenumber: string]: {
    [stepNumber: string]: {
      issuenumber: string;
      stepNumber: string;
      functionName: string;
      options: { [optionName: string]: string };
    };
  };
};
