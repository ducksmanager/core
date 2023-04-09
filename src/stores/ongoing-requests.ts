import { defineStore } from "pinia";

export const ongoingRequests = defineStore("ongoing-requests", () => ({
  numberOfOngoingAjaxCalls: null as number | null,
}));
