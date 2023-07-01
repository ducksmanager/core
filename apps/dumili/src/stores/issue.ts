import { defineStore } from "pinia";

export const images = defineStore("issue", () => ({
  currentIssueDetails: ref(),
  pages: ref(),
}));
