import { defineStore } from "pinia";

export const tabs = defineStore("tabs", () => ({
  activeTab: ref(undefined as number | undefined),
}));
