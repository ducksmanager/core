import { defineStore } from "pinia/dist/pinia";

export const ongoingRequests = defineStore("ongoing-requests", {
  state: () => ({
    numberOfOngoingAjaxCalls: null,
  }),
});
