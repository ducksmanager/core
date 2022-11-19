import axios from "axios";
import { defineStore } from "pinia";

import { users } from "~/stores/users";
import { issue, requestedIssue } from "~db_types/client_dm";

export const marketplace = defineStore("marketplace", {
  state: () => ({
    issuesOnSaleByOthers: null as {
      [key: string]: issue[];
    } | null,
    issueRequestsAsBuyer: null as requestedIssue[] | null,
    issueRequestsAsSeller: null as requestedIssue[] | null,
    isLoadingIssueRequestsAsBuyer: false,
    isLoadingIssueRequestsAsSeller: false,
    isLoadingIssuesOnSaleByOthers: false,

    contactMethods: {} as { [key: number]: { [key: string]: never } },
  }),

  getters: {
    sentRequestIssueIds: ({ issueRequestsAsBuyer }) =>
      issueRequestsAsBuyer?.map(({ issueId }) => issueId),

    sellerUserIds: ({ issuesOnSaleByOthers }) =>
      issuesOnSaleByOthers && [
        ...new Set(
          Object.values(issuesOnSaleByOthers).reduce(
            (acc, issues) => [...acc, ...issues.map((issue) => issue.userId)],
            [] as number[]
          )
        ),
      ],
    buyerUserIds: ({ issueRequestsAsSeller }) =>
      issueRequestsAsSeller && [
        ...new Set(issueRequestsAsSeller.map((issue) => issue.buyerId)),
      ],

    buyerUserNamesById: ({ buyerUserIds }) =>
      buyerUserIds?.reduce(
        (acc, userId) => ({
          ...acc,
          [userId]: users().stats[userId]?.username,
        }),
        {}
      ),

    sellerUserNames: ({ sellerUserIds }) =>
      sellerUserIds
        ?.reduce(
          (acc, userId) => [
            ...acc,
            { value: userId, text: users().stats[userId]?.username },
          ],
          []
        )
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2)),

    requestIssueIdsBySellerId: ({ issueRequestsAsBuyer, issuesOnSaleById }) =>
      issuesOnSaleById &&
      issueRequestsAsBuyer
        ?.filter(({ issueId }) => issuesOnSaleById[issueId])
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
      await this.loadIssueRequestsAsBuyer();
    },

    async loadContactMethods(userId: number) {
      this.contactMethods[userId] = (
        await axios.get(
          `/collection/on-sale-by-others/contact-methods/${userId}`
        )
      ).data;
    },

    async loadIssueRequestsAsBuyer(afterUpdate = false) {
      if (
        !afterUpdate &&
        (this.issueRequestsAsBuyer || this.isLoadingIssueRequestsAsBuyer)
      ) {
        return;
      }
      this.isLoadingIssueRequestsAsBuyer = true;
      this.issueRequestsAsBuyer = (
        await axios.get(`/collection/on-sale-by-others/requests/as/buyer`)
      ).data;
      this.isLoadingIssueRequestsAsBuyer = false;
    },
    async loadIssueRequestsAsSeller(afterUpdate = false) {
      if (
        !afterUpdate &&
        (this.issueRequestsAsSeller || this.isLoadingIssueRequestsAsSeller)
      ) {
        return;
      }
      this.isLoadingIssueRequestsAsSeller = true;
      this.issueRequestsAsSeller = (
        await axios.get(`/collection/on-sale-by-others/requests/as/seller`)
      ).data;
      this.isLoadingIssueRequestsAsSeller = false;
    },
    async loadIssuesOnSaleByOthers(afterUpdate = false) {
      if (
        !afterUpdate &&
        (this.issuesOnSaleByOthers || this.isLoadingIssuesOnSaleByOthers)
      ) {
        return;
      }
      this.isLoadingIssuesOnSaleByOthers = true;
      this.issuesOnSaleByOthers = (
        await axios.get("/collection/on-sale-by-others")
      ).data;
      this.isLoadingIssuesOnSaleByOthers = false;
    },
    async deleteRequestsToSeller(sellerId: number) {
      await axios.delete("/collection/on-sale-by-others/requests", {
        data: {
          sellerId,
        },
      });
    },
  },
});
