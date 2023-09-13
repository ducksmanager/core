import { defineStore } from "pinia";

import { Boundaries } from "~pulumi-types/KumikoResults";
import { OcrResult } from "~pulumi-types/OcrResults";

import { EntrySuggestion } from "./suggestions";

export type BoundariesWithText = {
  bbox: Boundaries;
  text: string;
}[];

export const ai = defineStore("ai", () => ({
  aiDetails: ref(
    {} as Record<
      string /* entry URL */,
      {
        panels: Omit<BoundariesWithText[0], "text">[];
        texts: {
          ocrResults: OcrResult[];
          possibleStories: EntrySuggestion["data"][];
        };
      }
    >
  ),
}));
