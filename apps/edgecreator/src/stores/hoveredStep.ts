import { defineStore } from "pinia";

export const hoveredStep = defineStore("hoveredStep", {
  state: () => ({
    issuenumber: null as string | null,
    stepNumber: null as number | null,
  }),
});
