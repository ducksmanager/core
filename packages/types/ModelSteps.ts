export type ModelSteps = {
  [shortIssuenumber: string]: {
    [stepNumber: string]: {
      shortIssuenumber: string;
      stepNumber: number;
      functionName: string;
      options: { [optionName: string]: string };
    };
  };
};
