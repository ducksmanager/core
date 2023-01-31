import { defineStore } from "pinia";

export const images = defineStore("images", {
  state: () => ({
    root: import.meta.env.VITE_IMAGES_ROOT,
  }),
  actions: {
    getImagePath(filePath: string) {
      return `${this.root}${filePath}`;
    },
  },
});
