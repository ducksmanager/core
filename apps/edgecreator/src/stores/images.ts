import { defineStore } from "pinia";

export const images = defineStore("images", () => {
  const root = "/images/",
    getImagePath = (filePath: string) => `${root}/${filePath}`;

  return { root, getImagePath };
});
