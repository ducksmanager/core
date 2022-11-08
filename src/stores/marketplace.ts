import axios from "axios";
import { defineStore } from "pinia";

import { issue, requestedIssue } from "~db_types/client_dm";

export const marketplace = defineStore("marketplace", {
  state: () => ({
    issuesOnSaleByOthers: null as {
      [key: string]: issue[];
    } | null,
    issueRequests: null as requestedIssue[] | null,
  }),

  getters: {
    pendingRequestIssueIds: ({ issueRequests }) =>
      issueRequests
        ?.filter(({ isEmailSent }) => !isEmailSent)
        .map(({ issueId }) => issueId),

    sentRequestIssueIds: ({ issueRequests }) =>
      issueRequests
        ?.filter(({ isEmailSent }) => isEmailSent)
        .map(({ issueId }) => issueId),

    pendingRequestIssueIdsBySellerId: ({ issueRequests, issuesOnSaleById }) =>
      issuesOnSaleById &&
      issueRequests
        ?.filter(({ isEmailSent }) => !isEmailSent)
        .reduce(
          (acc, { issueId }) => ({
            ...acc,
            [issuesOnSaleById[issueId].userId]: [
              ...(acc[issuesOnSaleById[issueId].userId] || []),
              issueId,
            ],
          }),
          {} as { [key: number]: number[] }
        ),

    issuesOnSaleById: ({ issuesOnSaleByOthers }) =>
      Object.values(issuesOnSaleByOthers || {}).reduce(
        (acc, issues) => ({
          ...acc,
          ...issues.reduce(
            (acc2, issue) => ({
              ...acc2,
              [issue.id]: {
                ...issue,
                publicationcode: `${issue.country}/${issue.magazine}`,
              },
            }),
            {}
          ),
        }),
        {}
      ),
  },

  actions: {
    async requestIssues(issueIds: number[]) {
      await axios.put(`/collection/on-sale-by-others/requests`, {
        issueIds,
      });
      await this.loadIssueRequests();
    },

    async loadIssueRequests() {
      this.issueRequests = (
        await axios.get(`/collection/on-sale-by-others/requests`)
      ).data;
    },
    async loadIssuesOnSaleByOthers() {
      this.issuesOnSaleByOthers = (
        await axios.get("/collection/on-sale-by-others")
      ).data;
    },
  },
});
