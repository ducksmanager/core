export type StepsPerIssuenumber = {
  [issuenumber: string]: {
    component: string;
    options?:
      | {
          [optionName: string]: string;
        }
      | undefined;
  }[];
};
