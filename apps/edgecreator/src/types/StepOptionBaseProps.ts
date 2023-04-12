import { OptionValue } from "~/types/OptionValue";

export interface BaseProps {
  issuenumber: string;
  stepNumber: number;

  options: Record<string, OptionValue | null> | undefined;
}
