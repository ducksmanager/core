import { defineStore } from "pinia";

export const hoveredStep = defineStore("hoveredStep", () => ({
  issuecode: ref<string>(),
  stepNumber: ref<number>(),
}));
