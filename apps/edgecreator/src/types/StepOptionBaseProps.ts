import type { OptionValue } from "~/types/OptionValue";

export interface BaseProps {
  issuecode: string;
  stepNumber: number;

  options: Record<string, OptionValue | null> | undefined;
}
