import { defineStore } from "pinia";

export const app = defineStore("app", {
  state: () => ({
    currentNavigationItem: undefined as string | undefined,
  }),
});
