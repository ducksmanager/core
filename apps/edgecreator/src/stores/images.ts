import { defineStore } from "pinia";

export const images = defineStore("images", {
  state: () => ({
    root: "/images",
  }),
  actions: {
    getImagePath(filePath: string) {
      return `${this.root}${filePath}`;
    },
  },
});
