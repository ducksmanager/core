import axios from "axios";
import { defineStore } from "pinia";

import { users } from "~/stores/users";
import { issue, requestedIssue } from "~prisma_clients/client_dm";

export const marketplace = defineStore("marketplace", {
  state: () => ({
    issuesOnSaleByOthers: null as {
      [publicationcode: string]: issue[];
    } | null,
    issueRequestsAsBuyer: null as requestedIssue[] | null,
    issueRequestsAsSeller: null as requestedIssue[] | null,
    isLoadingIssueRequestsAsBuyer: false as boolean,
    isLoadingIssueRequestsAsSeller: false as boolean,
    isLoadingIssuesOnSaleByOthers: false as boolean,

    contactMethods: {} as {
      [userId: number]: { [contactMethod: string]: string | number };
    },
  }),

  getters: {
    sentRequestIssueIds: ({ issueRequestsAsBuyer }) =>
      issueRequestsAsBuyer?.map(({ issueId }) => issueId),

    sellerUserIds: ({ issuesOnSaleByOthers }) =>
      (issuesOnSaleByOthers && [
        ...new Set(
          Object.values(issuesOnSaleByOthers).reduce(
            (acc, issues) => [...acc, ...issues.map((issue) => issue.userId)],
            [] as number[]
          )
        ),
      ]) ||
      [],
    buyerUserIds(): number[] {
      const issueRequestsAsSeller = this.issueRequestsAsSeller;
      return (
        (issueRequestsAsSeller && [
          ...new Set(issueRequestsAsSeller.map((issue) => issue.buyerId)),
        ]) ||
        []
      );
    },

    buyerUserNamesById() {
      const buyerUserIds: number[] = this.buyerUserIds;
      return (
        buyerUserIds?.reduce(
          (acc, userId) => ({
            ...acc,
            [userId]: users().stats[userId]?.username,
          }),
          {} as { [userId: number]: string }
        ) || null
      );
    },

    sellerUserNames() {
      const sellerUserIds: number[] = this.sellerUserIds;
      return sellerUserIds
        ?.reduce(
          (acc, userId) => [
            ...acc,
            { value: userId, text: users().stats[userId]?.username },
          ],
          [] as { value: number; text: string }[]
        )
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2));
    },

    requestIssueIdsBySellerId(): { [userId: number]: number[] } {
      const issueRequestsAsBuyer = this.issueRequestsAsBuyer;
      const issuesOnSaleById = this.issuesOnSaleById;
      return (
        (issuesOnSaleById &&
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
              {} as { [userId: number]: number[] }
            )) ||
        {}
      );
    },

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
            {} as { [issueId: number]: issue & { publicationcode: string } }
          ),
        }),
        {} as { [issueId: number]: issue & { publicationcode: string } }
      ),
  },

  actions: {
    async requestIssues(issueIds: number[]) {
      await PUT__collection__on_sale_by_others__requests(axios, {
        data: { issueIds },
      });
      await this.loadIssueRequestsAsBuyer();
    },

    async loadContactMethods(userId: number) {
      this.contactMethods[userId] = (
        await GET__collection__on_sale_by_others__contact_methods__$sellerId(
          axios,
          { urlParams: { sellerId: String(userId) } }
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
        await GET__collection__on_sale_by_others__requests__as__$as(axios, {
          urlParams: { as: "buyer" },
        })
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
        await GET__collection__on_sale_by_others__requests__as__$as(axios, {
          urlParams: { as: "seller" },
        })
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
        await GET__collection__on_sale_by_others(axios)
      ).data;
      this.isLoadingIssuesOnSaleByOthers = false;
    },
    async deleteRequestToSeller(issueId: number) {
      await DELETE__collection__on_sale_by_others__requests(axios, {
        data: {
          issueId,
        },
      });
    },
  },
});
