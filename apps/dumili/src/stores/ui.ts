import { entry } from "~prisma/client_dumili";

export const ui = defineStore("user", () => ({
  showAiDetectionsOn: ref<number | undefined>(undefined),
  hoveredEntry: ref<entry | null>(null),
}));
