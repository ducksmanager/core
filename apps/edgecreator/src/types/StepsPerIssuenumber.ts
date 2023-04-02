import { Step } from "~/types/Step";

export type StepsPerIssuenumber = {
  [issuenumber: string]: Step[];
};
