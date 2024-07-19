export const tabs = defineStore("tabs", () => ({
  tabNames: ["Book", "Page gallery", "Text editor"] as const,
  activeTab: ref(0),
}));
