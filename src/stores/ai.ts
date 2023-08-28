import { defineStore } from "pinia";

import { Boundaries } from "~types/KumikoResults";

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
        texts: BoundariesWithText;
      }
    >
  ),
}));
