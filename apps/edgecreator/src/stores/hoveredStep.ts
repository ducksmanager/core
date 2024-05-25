import { defineStore } from "pinia";

export const hoveredStep = defineStore("hoveredStep", () => ({
  issuenumber: ref<string | null>(null),
  stepNumber: ref<number | null>(null),
}));
