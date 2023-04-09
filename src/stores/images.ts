import { defineStore } from "pinia";

export const images = defineStore("images", () => ({
  getImagePath: (filePath: string) =>
    `${import.meta.env.VITE_IMAGES_ROOT}${filePath}`,
}));
