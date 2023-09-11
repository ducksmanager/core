import { defineStore } from "pinia";

import { StorySearchResults } from "~dm-types/StorySearchResults";
import { Boundaries } from "~pulumi-types/KumikoResults";

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
          ocrResults: BoundariesWithText;
          possibleStories: StorySearchResults;
        };
      }
    >
  ),
}));
