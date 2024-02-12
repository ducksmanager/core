export const tabs = defineStore("tabs", () => ({
  tabNames: ["page-gallery", "book", "text-editor"] as const,
  activeTab: ref<number>(0),
}));
