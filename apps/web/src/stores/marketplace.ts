import type { issue, requestedIssue } from "~prisma-clients/client_dm";
import {
  NamespaceEndpoint as CollectionNamespaceEndpoint,
  Services as CollectionServices,
} from "~services/collection/types";
import { EventReturnType } from "~services/types";

const services = useSocket<CollectionServices>(CollectionNamespaceEndpoint);
export const marketplace = defineStore("marketplace", () => {
  const issuesOnSaleByOthers = ref(
      null as EventReturnType<CollectionServices["getIssuesForSale"]> | null,
    ),
    issueRequestsAsBuyer = ref(null as requestedIssue[] | null),
    issueRequestsAsSeller = ref(null as requestedIssue[] | null),
    isLoadingIssueRequestsAsBuyer = ref(false as boolean),
    isLoadingIssueRequestsAsSeller = ref(false as boolean),
    isLoadingIssuesOnSaleByOthers = ref(false as boolean),
    contactMethods = ref(
      {} as {
        [userId: number]: EventReturnType<
          CollectionServices["getContactMethods"]
        >;
      },
    ),
    sentRequestIssueIds = computed(
      () => issueRequestsAsBuyer.value?.map(({ issueId }) => issueId),
    ),
    sellerUserIds = computed(
      () =>
        (issuesOnSaleByOthers.value && [
          ...new Set(
            Object.values(issuesOnSaleByOthers.value).reduce(
              (acc, issues) => [...acc, ...issues.map((issue) => issue.userId)],
              [] as number[],
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
        buyerUserIds.value?.reduce(
          (acc, userId) => ({
            ...acc,
            [userId]: users().stats[userId]?.username,
          }),
          {} as { [userId: number]: string },
        ) || null,
    ),
    sellerUserNames = computed(
      () =>
        sellerUserIds.value
          ?.reduce(
            (acc, userId) => [
              ...acc,
              { value: userId, text: users().stats[userId]?.username },
            ],
            [] as { value: number; text: string }[],
          )
          .sort(({ text: text1 }, { text: text2 }) =>
            text1.localeCompare(text2),
          ),
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
              {} as { [userId: number]: number[] },
            )) ||
        {},
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
            {} as Record<number, issue & { publicationcode: string }>,
          ),
        }),
        {} as Record<number, issue & { publicationcode: string }>,
      ),
    ),
    requestIssues = async (issueIds: number[]) => {
      await services.createRequests(issueIds);
      await loadIssueRequestsAsBuyer();
    },
    loadContactMethods = async (userId: number) => {
      const result = await services.getContactMethods(userId);
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
      issueRequestsAsBuyer.value = await services.getRequests("buyer");
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
      issueRequestsAsSeller.value = await services.getRequests("seller");
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
      issuesOnSaleByOthers.value = await services.getIssuesForSale();
      isLoadingIssuesOnSaleByOthers.value = false;
    },
    deleteRequestToSeller = async (issueId: number) => {
      await services.deleteRequests(issueId);
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
