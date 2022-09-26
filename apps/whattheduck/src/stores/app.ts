import { defineStore } from "pinia";

export const app = defineStore("app", {
  state: () => ({
    currentNavigationItem: null as string | null,
  }),
});
