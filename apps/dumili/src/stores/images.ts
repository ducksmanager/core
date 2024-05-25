export const images = defineStore("images", () => ({
  getFlagsPath: (flag: string) => `${import.meta.env.VITE_FLAGS_ROOT}${flag}`,
}));
