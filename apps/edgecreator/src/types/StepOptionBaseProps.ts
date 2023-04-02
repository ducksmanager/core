import { OptionValue } from "~/types/OptionValue";

export type BaseProps = {
  issuenumber: string;
  stepNumber: number;

  options:
    | {
        [optionName: string]: OptionValue | null;
      }
    | undefined;
};
