import { defineStore } from "pinia";

export const hoveredStep = defineStore("hoveredStep", () => ({
  issuecode: ref<string | null>(null),
  stepNumber: ref<number | null>(null),
}));
