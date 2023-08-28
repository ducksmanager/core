import { defineStore } from "pinia";

export const user = defineStore("user", () => ({
  user: ref(null as { username: string } | null | undefined),
  showAiDetectionsOn: ref(undefined as string | undefined),
}));
