import { OptionValue } from "~/types/OptionValue";

export type StepOptions =
  | {
      [optionName: string]: OptionValue;
    }
  | undefined;
