import axios from "axios";
import { defineStore } from "pinia";

import { users } from "~/stores/users";
import { call } from "~/util/axios";
import { issue, requestedIssue } from "~prisma-clients/client_dm";
import {
  DELETE__collection__on_sale_by_others__requests,
  GET__collection__on_sale_by_others,
  GET__collection__on_sale_by_others__contact_methods__$sellerId,
  GET__collection__on_sale_by_others__requests__as__$as,
  PUT__collection__on_sale_by_others__requests,
} from "~types/routes";

export const marketplace = defineStore("marketplace", () => {
  const issuesOnSaleByOthers = ref(
      null as GET__collection__on_sale_by_others["resBody"] | null
    ),
    issueRequestsAsBuyer = ref(null as requestedIssue[] | null),
    issueRequestsAsSeller = ref(null as requestedIssue[] | null),
    isLoadingIssueRequestsAsBuyer = ref(false as boolean),
    isLoadingIssueRequestsAsSeller = ref(false as boolean),
    isLoadingIssuesOnSaleByOthers = ref(false as boolean),
    contactMethods = ref(
      {} as {
        [
          userId: number
        ]: GET__collection__on_sale_by_others__contact_methods__$sellerId["resBody"];
      }
    ),
    sentRequestIssueIds = computed(() =>
      issueRequestsAsBuyer.value?.map(({ issueId }) => issueId)
    ),
    sellerUserIds = computed(
      () =>
        (issuesOnSaleByOthers.value && [
          ...new Set(
            Object.values(issuesOnSaleByOthers.value).reduce(
              (acc, issues) => [...acc, ...issues.map((issue) => issue.userId)],
              [] as number[]
            )
          ),
        ]) ||
        []
    ),
    buyerUserIds = computed(
      () =>
        (issueRequestsAsSeller.value && [
          ...new Set(issueRequestsAsSeller.value.map((issue) => issue.buyerId)),
        ]) ||
        []
    ),
    buyerUserNamesById = computed(
      () =>
        buyerUserIds.value?.reduce(
          (acc, userId) => ({
            ...acc,
            [userId]: users().stats[userId]?.username,
          }),
          {} as { [userId: number]: string }
        ) || null
    ),
    sellerUserNames = computed(() =>
      sellerUserIds.value
        ?.reduce(
          (acc, userId) => [
            ...acc,
            { value: userId, text: users().stats[userId]?.username },
          ],
          [] as { value: number; text: string }[]
        )
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2))
    ),
    requestIssueIdsBySellerId = computed(
      () =>
        (issuesOnSaleById.value &&
          issueRequestsAsBuyer.value
            ?.filter(({ issueId }) => issuesOnSaleById.value[issueId])
            .reduce(
              (acc, { issueId }) => ({
                ...acc,
                [issuesOnSaleById.value[issueId].userId]: [
                  ...(acc[issuesOnSaleById.value[issueId].userId] || []),
                  issueId,
                ],
              }),
              {} as { [userId: number]: number[] }
            )) ||
        {}
    ),
    issuesOnSaleById = computed(() =>
      Object.values(issuesOnSaleByOthers.value || {}).reduce(
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
            {} as Record<number, issue & { publicationcode: string }>
          ),
        }),
        {} as Record<number, issue & { publicationcode: string }>
      )
    ),
    requestIssues = async (issueIds: number[]) => {
      await call(
        axios,
        new PUT__collection__on_sale_by_others__requests({
          reqBody: { issueIds },
        })
      );
      await loadIssueRequestsAsBuyer();
    },
    loadContactMethods = async (userId: number) => {
      contactMethods.value[userId] = (
        await call(
          axios,
          new GET__collection__on_sale_by_others__contact_methods__$sellerId({
            params: { sellerId: String(userId) },
          })
        )
      ).data;
    },
    loadIssueRequestsAsBuyer = async (afterUpdate = false) => {
      if (
        !afterUpdate &&
        (issueRequestsAsBuyer.value || isLoadingIssueRequestsAsBuyer.value)
      ) {
        return;
      }
      isLoadingIssueRequestsAsBuyer.value = true;
      issueRequestsAsBuyer.value = (
        await call(
          axios,
          new GET__collection__on_sale_by_others__requests__as__$as({
            params: { as: "buyer" },
          })
        )
      ).data;
      isLoadingIssueRequestsAsBuyer.value = false;
    },
    loadIssueRequestsAsSeller = async (afterUpdate = false) => {
      if (
        !afterUpdate &&
        (issueRequestsAsSeller.value || isLoadingIssueRequestsAsSeller.value)
      ) {
        return;
      }
      isLoadingIssueRequestsAsSeller.value = true;
      issueRequestsAsSeller.value = (
        await call(
          axios,
          new GET__collection__on_sale_by_others__requests__as__$as({
            params: { as: "seller" },
          })
        )
      ).data;
      isLoadingIssueRequestsAsSeller.value = false;
    },
    loadIssuesOnSaleByOthers = async (afterUpdate = false) => {
      if (
        !afterUpdate &&
        (issuesOnSaleByOthers.value || isLoadingIssuesOnSaleByOthers.value)
      ) {
        return;
      }
      isLoadingIssuesOnSaleByOthers.value = true;
      issuesOnSaleByOthers.value = (
        await call(axios, new GET__collection__on_sale_by_others())
      ).data;
      isLoadingIssuesOnSaleByOthers.value = false;
    },
    deleteRequestToSeller = async (issueId: number) => {
      await call(
        axios,
        new DELETE__collection__on_sale_by_others__requests({
          reqBody: { issueId },
        })
      );
    };

  return {
    issuesOnSaleByOthers,
    issueRequestsAsBuyer,
    issueRequestsAsSeller,
    isLoadingIssueRequestsAsBuyer,
    isLoadingIssueRequestsAsSeller,
    isLoadingIssuesOnSaleByOthers,
    contactMethods,
    sentRequestIssueIds,
    sellerUserIds,
    buyerUserIds,
    buyerUserNamesById,
    sellerUserNames,
    requestIssueIdsBySellerId,
    issuesOnSaleById,
    requestIssues,
    loadContactMethods,
    loadIssueRequestsAsBuyer,
    loadIssueRequestsAsSeller,
    loadIssuesOnSaleByOthers,
    deleteRequestToSeller,
  };
});
