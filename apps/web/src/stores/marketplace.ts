import type CollectionServices from "~dm-services/collection/types";
import type {
  issue as dmIssue,
  requestedIssue,
} from "~prisma-clients/schemas/dm";
import type { EventReturnType } from "~socket.io-services/types";

import { dmSocketInjectionKey } from "../composables/useDmSocket";

export const marketplace = defineStore("marketplace", () => {
  const {
    collection: { services: collectionServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const issuesOnSaleByOthers = ref<EventReturnType<
      CollectionServices["getIssuesForSale"]
    > | null>(null),
    issueRequestsAsBuyer = shallowRef<requestedIssue[] | null>(null),
    issueRequestsAsSeller = shallowRef<requestedIssue[] | null>(null),
    isLoadingIssueRequestsAsBuyer = ref(false),
    isLoadingIssueRequestsAsSeller = ref(false),
    isLoadingIssuesOnSaleByOthers = ref(false),
    contactMethods = ref<{
      [userId: number]: EventReturnType<
        CollectionServices["getContactMethods"]
      >;
    }>({}),
    sentRequestIssueIds = computed(() =>
      issueRequestsAsBuyer.value?.map(({ issueId }) => issueId),
    ),
    sellerUserIds = computed(
      () =>
        (issuesOnSaleByOthers.value && [
          ...new Set(
            Object.values(issuesOnSaleByOthers.value).map(
              (issue) => issue.userId,
            ),
          ),
        ]) ||
        [],
    ),
    buyerUserIds = computed(
      () =>
        (issueRequestsAsSeller.value && [
          ...new Set(issueRequestsAsSeller.value.map((issue) => issue.buyerId)),
        ]) ||
        [],
    ),
    buyerUserNamesById = computed(
      () =>
        buyerUserIds.value?.reduce<{ [userId: number]: string }>(
          (acc, userId) => ({
            ...acc,
            [userId]: users().stats[userId]?.username,
          }),
          {},
        ) || null,
    ),
    sellerUserNames = computed(() =>
      sellerUserIds.value
        ?.reduce<
          { value: number; text: string }[]
        >((acc, userId) => [...acc, { value: userId, text: users().stats[userId]?.username }], [])
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2)),
    ),
    requestIssueIdsBySellerId = computed(
      () =>
        (issuesOnSaleById.value &&
          issueRequestsAsBuyer.value
            ?.filter(({ issueId }) => issuesOnSaleById.value[issueId])
            .reduce<{ [userId: number]: number[] }>(
              (acc, { issueId }) => ({
                ...acc,
                [issuesOnSaleById.value[issueId].userId]: [
                  ...(acc[issuesOnSaleById.value[issueId].userId] || []),
                  issueId,
                ],
              }),
              {},
            )) ||
        {},
    ),
    issuesOnSaleById = computed(() =>
      Object.values(issuesOnSaleByOthers.value || []).reduce<
        Record<number, dmIssue>
      >(
        (acc, issues) => ({
          ...acc,
          ...issues.reduce<Record<number, dmIssue>>(
            (acc2, issue) => ({
              ...acc2,
              [issue.id]: issue,
            }),
            {},
          ),
        }),
        {},
      ),
    ),
    requestIssues = async (issueIds: number[]) => {
      await collectionServices.createRequests(issueIds);
      await loadIssueRequestsAsBuyer();
    },
    loadContactMethods = async (userId: number) => {
      const result = await collectionServices.getContactMethods(userId);
      switch (result.error) {
        case undefined:
          contactMethods.value[userId] = result;
          break;
        default:
          console.error(result.error, result.errorDetails);
      }
    },
    loadIssueRequestsAsBuyer = async (afterUpdate = false) => {
      if (
        !afterUpdate &&
        (issueRequestsAsBuyer.value || isLoadingIssueRequestsAsBuyer.value)
      ) {
        return;
      }
      isLoadingIssueRequestsAsBuyer.value = true;
      issueRequestsAsBuyer.value =
        await collectionServices.getRequests("buyer");
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
      issueRequestsAsSeller.value =
        await collectionServices.getRequests("seller");
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
      issuesOnSaleByOthers.value = await collectionServices.getIssuesForSale();
      isLoadingIssuesOnSaleByOthers.value = false;
    },
    deleteRequestToSeller = async (issueId: number) => {
      await collectionServices.deleteRequests(issueId);
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
