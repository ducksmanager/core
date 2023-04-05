import { defineStore } from "pinia";

export const hoveredStep = defineStore("hoveredStep", () => ({
  issuenumber: ref(null as string | null),
  stepNumber: ref(null as number | null),
}));
