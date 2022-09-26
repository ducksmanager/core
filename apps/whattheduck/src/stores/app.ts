import { defineStore } from "pinia";

export const app = defineStore("app", {
  state: () => ({
    currentCountry: null as string | null,
    currentPublication: null as string | null,
  }),
});
