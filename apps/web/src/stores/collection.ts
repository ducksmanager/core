import type { ShallowRef } from "vue";

import type CollectionServices from "~dm-services/collection/types";
import type StatsServices from "~dm-services/stats/types";
import type {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";
import type {
  authorUser,
  issue,
  purchase,
  subscription,
} from "~prisma-schemas/schemas/dm";
import type { EventReturnType } from "~socket.io-services/types";

import useCollection from "../composables/useCollection";
import { socketInjectionKey } from "../composables/useDmSocket";
import { bookcase } from "./bookcase";

export type IssueWithPublicationcodeOptionalId = Omit<
  issue,
  "id" | "issuenumber"
> & {
  id: number | null;
};

export type SubscriptionTransformedStringDates = Omit<
  subscription,
  "startDate" | "endDate"
> & {
  startDate: string;
  endDate: string;
};

export type purchaseWithStringDate = Omit<purchase, "date"> & {
  date: string;
};

export const collection = defineStore("collection", () => {
  const {
    collection: { services: collectionServices },
    stats: { services: statsServices },
    auth: { services: authServices },
    options: socketOptions,
  } = inject(socketInjectionKey)!;

  const { bookcaseWithPopularities } = storeToRefs(bookcase());

  const issues = shallowRef<
    EventReturnType<CollectionServices["getIssues"]>["issues"] | null
  >(null);

  const collectionUtils = useCollection(
    issues as ShallowRef<(issue & { issuecode: string })[]>,
  ),
    watchedPublicationsWithSales = shallowRef<string[] | null>(null),
    purchases = shallowRef<purchase[] | null>(null),
    watchedAuthors = shallowRef<authorUser[] | null>(null),
    marketplaceContactMethods = ref<string[] | null>(null),
    suggestions = shallowRef<EventReturnType<
      StatsServices["getSuggestionsForCountry"]
    > | null>(null),
    subscriptions = shallowRef<subscription[] | null>(null),
    popularIssuesInCollection = ref<{
      [issuecode: string]: number;
    } | null>(null),
    lastPublishedEdgesForCurrentUser = shallowRef<EventReturnType<
      CollectionServices["getLastPublishedEdges"]
    > | null>(null),
    isLoadingUser = ref(false),
    isLoadingCollection = ref(false),
    isLoadingWatchedPublicationsWithSales = ref(false),
    isLoadingMarketplaceContactMethods = ref(false),
    isLoadingPurchases = ref(false),
    isLoadingSuggestions = ref(false),
    isLoadingSubscriptions = ref(false),
    coaIssueCountsPerCountrycode = shallowRef<
      | EventReturnType<CollectionServices["getIssues"]>["countByCountrycode"]
      | null
    >(null),
    coaIssueCountsByPublicationcode = shallowRef<
      | EventReturnType<
        CollectionServices["getIssues"]
      >["countByPublicationcode"]
      | null
    >(null),
    user = shallowRef<
      EventReturnType<CollectionServices["getUser"]> | undefined | null
    >(undefined),
    userPermissions = shallowRef<
      EventReturnType<CollectionServices["getUserPermissions"]> | undefined
    >(undefined),
    previousVisit = ref<Date | null>(null),
    publicationUrlRoot = computed(() => "/collection/show"),
    purchasesById = computed(() => purchases.value?.groupBy("id")),
    copiesPerIssuecode = computed(() =>
      issues.value?.groupBy("issuecode", "[]"),
    ),
    hasSuggestions = computed(
      () => Object.keys(suggestions.value?.oldestdate.issues || {}).length,
    ),
    issuecodesPerPublication = computed(
      () => issues.value?.groupBy("publicationcode", "[]") || {},
    ),
    totalPerPublicationUniqueIssuecodes = computed(() =>
      Object.fromEntries(
        Object.entries(issuecodesPerPublication.value || {}).map(
          ([publicationcode, issuecodes]) => [
            publicationcode,
            new Set(issuecodes).size,
          ],
        ),
      ),
    ),
    totalPerPublicationUniqueIssuecodesSorted = computed(
      () =>
        totalPerPublicationUniqueIssuecodes.value &&
        Object.entries(totalPerPublicationUniqueIssuecodes.value).sort(
          ([publicationcode1], [publicationcode2]) =>
            Math.sign(
              totalPerPublicationUniqueIssuecodes.value[publicationcode2]! -
              totalPerPublicationUniqueIssuecodes.value[publicationcode1]!,
            ),
        ),
    ),
    popularIssuesInCollectionWithoutEdge = computed(() =>
      bookcaseWithPopularities.value
        ?.filter(
          ({ edgeId, popularity }) => !edgeId && popularity && popularity > 0,
        )
        .sort(({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 && popularity1 ? popularity2 - popularity1 : 0,
        ),
    ),
    userForAccountForm = computed(() => {
      if (!user.value) {
        return null;
      }
      return {
        ...user.value,
        discordId: user.value.discordId
          ? String(user.value.discordId)
          : undefined,
        presentationText: user.value.presentationText || "",
        email: user.value.email!,
        marketplaceAcceptsExchanges:
          user.value.marketplaceAcceptsExchanges || false,
      };
    }),
    updateCollectionSingleIssue = async (data: CollectionUpdateSingleIssue) => {
      await collectionServices.addOrChangeCopies(data);
      await loadCollection(true);
    },
    updateCollectionMultipleIssues = async (
      data: CollectionUpdateMultipleIssues,
    ) => {
      await collectionServices.addOrChangeIssues(data);
      await loadCollection(true);
    },
    createPurchase = async (date: string, description: string) => {
      await collectionServices.createPurchase(date, description);
      await loadPurchases(true);
    },
    deletePurchase = async (id: number) => {
      await collectionServices.deletePurchase(id);
      await loadPurchases(true);
    },
    loadPreviousVisit = async () => {
      const result = await collectionServices.getLastVisit();
      if (typeof result === "object" && result?.error) {
        console.error(result.error);
      } else if (result) {
        previousVisit.value = new Date(result as string);
      }
    },
    loadCollection = async (afterUpdate = false) => {
      if (afterUpdate || (!isLoadingCollection.value && !issues.value)) {
        isLoadingCollection.value = true;
        let publicationNames: Record<string, string> = {};
        ({
          issues: issues.value,
          countByCountrycode: coaIssueCountsPerCountrycode.value,
          countByPublicationcode: coaIssueCountsByPublicationcode.value,
          publicationNames,
        } = await collectionServices.getIssues());
        coa().addPublicationNames(publicationNames);
        Object.assign(
          coa().issuecodeDetails,
          issues.value.map(({ issuecode, publicationcode, issuenumber }) => ({
            issuecode,
            publicationcode,
            issuenumber,
          })),
        );
      }

      Object.assign(
        coa().issuecodeDetails,
        issues
          .value!.map(({ issuecode, publicationcode, issuenumber }) => ({
            issuecode,
            publicationcode,
            issuenumber,
          }))
          .groupBy("issuecode"),
      );
      isLoadingCollection.value = false;
    },
    loadPurchases = async (afterUpdate = false) => {
      if (afterUpdate || (!isLoadingPurchases.value && !purchases.value)) {
        isLoadingPurchases.value = true;
        purchases.value = (await collectionServices.getPurchases()).map(
          (purchase) => ({
            ...purchase,
            date: new Date(purchase.date),
          }),
        );
        isLoadingPurchases.value = false;
      }
    },
    loadWatchedPublicationsWithSales = async (afterUpdate = false) => {
      if (
        afterUpdate ||
        (!isLoadingWatchedPublicationsWithSales.value &&
          !watchedPublicationsWithSales.value)
      ) {
        isLoadingWatchedPublicationsWithSales.value = true;
        watchedPublicationsWithSales.value = await collectionServices.getOption(
          "sales_notification_publications",
        );
        isLoadingWatchedPublicationsWithSales.value = false;
      }
    },
    loadMarketplaceContactMethods = async (afterUpdate = false) => {
      if (
        afterUpdate ||
        (!isLoadingMarketplaceContactMethods.value &&
          !marketplaceContactMethods.value)
      ) {
        isLoadingMarketplaceContactMethods.value = true;
        marketplaceContactMethods.value = await collectionServices.getOption(
          "marketplace_contact_methods",
        );
        isLoadingMarketplaceContactMethods.value = false;
      }
    },
    updateMarketplaceContactMethods = async () =>
      await collectionServices.getOption("marketplace_contact_methods"),
    updateWatchedPublicationsWithSales = async () =>
      await collectionServices.setOption(
        "sales_notification_publications",
        watchedPublicationsWithSales.value!,
      ),
    loadSuggestions = async ({
      countryCode,
      sinceLastVisit,
    }: {
      countryCode: string;
      sinceLastVisit: boolean;
    }) => {
      if (!isLoadingSuggestions.value) {
        isLoadingSuggestions.value = true;
        suggestions.value = await statsServices.getSuggestionsForCountry(
          countryCode || "ALL",
          sinceLastVisit ? "since_previous_visit" : "_",
          sinceLastVisit ? 100 : 20,
        );
        isLoadingSuggestions.value = false;
      }
    },
    loadSubscriptions = async (afterUpdate = false) => {
      if (
        afterUpdate ||
        (!isLoadingSubscriptions.value && !subscriptions.value)
      ) {
        isLoadingSubscriptions.value = true;
        subscriptions.value = (await collectionServices.getSubscriptions()).map(
          (subscription: SubscriptionTransformedStringDates) => ({
            ...subscription,
            startDate: new Date(Date.parse(subscription.startDate)),
            endDate: new Date(Date.parse(subscription.endDate)),
          }),
        );
        isLoadingSubscriptions.value = false;
      }
    },
    loadPopularIssuesInCollection = async () => {
      if (!popularIssuesInCollection.value) {
        popularIssuesInCollection.value =
          await collectionServices.getCollectionPopularity();
      }
    },
    loadUserIssueQuotations = async () => {
      const data = await collectionServices.getCollectionQuotations();

      if (data.quotations) {
        coa().addIssueQuotations(data.quotations);
      } else {
        console.error(data.error);
      }
    },
    loadLastPublishedEdgesForCurrentUser = async () => {
      if (!lastPublishedEdgesForCurrentUser.value) {
        lastPublishedEdgesForCurrentUser.value =
          await collectionServices.getLastPublishedEdges();
      }
    },
    login = async (
      username: string,
      password: string,
      onSuccess: (token: string) => void,
      onError: (e: string) => void,
    ) => {
      const response = await authServices.login({
        username,
        password,
      });
      if (typeof response !== "string" && "error" in response) {
        onError(response.error!);
      } else {
        onSuccess(response as string);
      }
    },
    loadUser = async (afterUpdate = false) => {
      if (!isLoadingUser.value && (afterUpdate || !user.value)) {
        isLoadingUser.value = true;
        const response = await collectionServices.getUser();
        if (typeof response === "object" && "error" in response) {
          socketOptions.session.clearSession();
          user.value = null;
        } else {
          user.value = response;
        }
        isLoadingUser.value = false;
      }
    },
    loadUserPermissions = async () => {
      userPermissions.value = await collectionServices.getUserPermissions();
    },
    hasRole = (thisPrivilege: string) =>
      userPermissions.value?.some(
        ({ privilege, role }) =>
          role === "EdgeCreator" && privilege === thisPrivilege,
      ) || false;

  console.log(issues.value);
  return {
    ...collectionUtils,
    authServices,
    issues,
    publicationUrlRoot,
    createPurchase,
    deletePurchase,
    hasRole,
    hasSuggestions,
    isLoadingUser,
    coaIssueCountsByPublicationcode,
    copiesPerIssuecode,
    coaIssueCountsPerCountrycode,
    isLoadingSuggestions,
    issuecodesPerPublication,
    lastPublishedEdgesForCurrentUser,
    loadCollection,
    loadUserIssueQuotations,
    loadLastPublishedEdgesForCurrentUser,
    loadMarketplaceContactMethods,
    loadPopularIssuesInCollection,
    loadPreviousVisit,
    loadPurchases,
    loadSubscriptions,
    loadSuggestions,
    loadUser,
    loadUserPermissions,
    loadWatchedPublicationsWithSales,
    login,
    marketplaceContactMethods,
    popularIssuesInCollection,
    popularIssuesInCollectionWithoutEdge,
    previousVisit,
    purchases,
    purchasesById,
    subscriptions,
    suggestions,
    totalPerPublicationUniqueIssuecodes,
    totalPerPublicationUniqueIssuecodesSorted,
    updateCollectionMultipleIssues,
    updateCollectionSingleIssue,
    updateMarketplaceContactMethods,
    updateWatchedPublicationsWithSales,
    user,
    userForAccountForm,
    userPermissions,
    watchedAuthors,
    watchedPublicationsWithSales,
  };
});
