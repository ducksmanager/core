import { Boundaries } from "~dumili-types/KumikoResult";
import { OcrResult } from "~dumili-types/OcrResults";
import { EntrySuggestion } from "~dumili-types/suggestions";

export type BoundariesWithText = {
  bbox: Boundaries;
  text: string;
}[];

export const ai = defineStore("ai", () => ({
  aiDetails: ref<
    Record<
      string /* entry URL */,
      {
        panels: Omit<BoundariesWithText[0], "text">[];
        texts: {
          ocrResults: OcrResult[];
          possibleStories: EntrySuggestion["data"][];
        };
      }
    >
  >({}),
}));
