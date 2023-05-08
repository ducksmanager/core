import { defineStore } from "pinia";
import { ref } from "vue";

import { createAxios } from "~/axios-helper";

export const api = defineStore("api", () => ({
  dmApi: ref(createAxios(import.meta.env.VITE_DM_API_URL as string)),
}));
