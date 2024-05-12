import { defineStore } from "pinia";

import { createAxios } from "../../axios-helper";

export const api = defineStore("api", () => ({
  dmApi: ref(createAxios(import.meta.env.VITE_DM_API_URL as string)),
  edgeCreatorApi: ref(
    createAxios(import.meta.env.VITE_EDGECREATOR_API_URL as string),
  ),
}));
