import { defineStore } from "pinia";

import { createAxios } from "../../axios";

export const api = defineStore("api", {
  state: () => ({
    dmApi: createAxios(import.meta.env.VITE_DM_API_URL),
    edgeCreatorApi: createAxios(import.meta.env.VITE_EDGECREATOR_API_URL),
  }),
});
