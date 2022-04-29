import { defineStore } from "pinia";

export const ongoingRequests = defineStore("ongoing-requests", {
  state: () => ({
    numberOfOngoingAjaxCalls: null,
  }),
});
