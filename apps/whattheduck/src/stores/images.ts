import { defineStore } from 'pinia';

export const images = defineStore('images', () => ({
  getImagePath: (filePath: string) => `${import.meta.env.VITE_DM_URL}/images/${filePath}`,
}));
