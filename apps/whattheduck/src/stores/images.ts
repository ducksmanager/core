import { defineStore } from 'pinia';

export const images = defineStore('images', () => ({
  getImagePath: (filePath: string) => `/images/${filePath}`,
}));
