import { defineStore } from "pinia";

import { createAxios } from "~/axios-helper";
import { ref } from "vue";

export const api = defineStore("api", () => ({
  dmApi: ref(createAxios(import.meta.env.VITE_DM_API_URL as string)),
}));
