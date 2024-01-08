import {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";
import { ScopedError } from "~dm-types/ScopedError";
import { authorUser, purchase } from "~prisma-clients/client_dm";
import {
  issueWithPublicationcode,
  subscriptionWithPublicationcode,
} from "~prisma-clients/extended/dm.extends";
import CollectionServices from "~services/collection/types";
import StatsServices from "~services/stats/types";
import { EventReturnType } from "~services/types";

import useCollection from "../composables/useCollection";
import {
  collectionServices,
  loginServices,
  statsServices,
} from "../composables/useSocket";
import { bookcase } from "./bookcase";

export type IssueWithPublicationcodeOptionalId = Omit<
  issueWithPublicationcode,
  "id"
> & {
  id: number | null;
};

export type SubscriptionTransformed = Omit<
  subscriptionWithPublicationcode,
  "country" | "magazine"
>;

export type SubscriptionTransformedStringDates = Omit<
  SubscriptionTransformed,
  "startDate" | "endDate"
> & {
  startDate: string;
  endDate: string;
};

export type purchaseWithStringDate = Omit<purchase, "date"> & {
  date: string;
};

let sessionExistsFn: () => Promise<boolean>,
  clearSessionFn: () => Promise<void>;

export const collection = defineStore("collection", () => {
  const issues = ref(null as issueWithPublicationcode[] | null);

  const collectionUtils = useCollection(issues),
    watchedPublicationsWithSales = ref(null as string[] | null),
    purchases = ref(null as purchase[] | null),
    watchedAuthors = ref(null as authorUser[] | null),
    marketplaceContactMethods = ref(null as string[] | null),
    suggestions = ref(
      null as EventReturnType<StatsServices["getSuggestionsForCountry"]> | null,
    ),
    subscriptions = ref(null as SubscriptionTransformed[] | null),
    popularIssuesInCollection = ref(
      null as { [issuecode: string]: number } | null,
    ),
    lastPublishedEdgesForCurrentUser = ref(
      null as EventReturnType<
        CollectionServices["getLastPublishedEdges"]
      > | null,
    ),
    isLoadingUser = ref(false as boolean),
    isLoadingCollection = ref(false as boolean),
    isLoadingWatchedPublicationsWithSales = ref(false as boolean),
    isLoadingMarketplaceContactMethods = ref(false as boolean),
    isLoadingPurchases = ref(false as boolean),
    isLoadingSuggestions = ref(false as boolean),
    isLoadingSubscriptions = ref(false as boolean),
    user = ref(
      undefined as
        | EventReturnType<CollectionServices["getUser"]>
        | undefined
        | null,
    ),
    previousVisit = ref(null as Date | null),
    publicationUrlRoot = computed(() => "/collection/show"),
    purchasesById = computed(
      (): Record<string, purchase> | undefined =>
        purchases.value?.reduce(
          (acc, purchase) => ({ ...acc, [purchase.id as number]: purchase }),
          {},
        ),
    ),
    hasSuggestions = computed(
      () =>
        suggestions.value?.issues &&
        Object.keys(suggestions.value.issues).length,
    ),
    issueNumbersPerPublication = computed(
      () =>
        issues.value?.reduce(
          (acc, { country, issuenumber, magazine }) => ({
            ...acc,
            [`${country}/${magazine}`]: [
              ...(acc[`${country}/${magazine}`] || []),
              issuenumber,
            ],
          }),
          {} as { [publicationcode: string]: string[] },
        ) || {},
    ),
    totalPerPublicationUniqueIssueNumbers = computed(
      (): {
        [publicationcode: string]: number;
      } =>
        issueNumbersPerPublication.value &&
        Object.keys(issueNumbersPerPublication.value).reduce(
          (acc, publicationcode) => ({
            ...acc,
            [publicationcode]: [
              ...new Set(issueNumbersPerPublication.value[publicationcode]),
            ].length,
          }),
          {},
        ),
    ),
    totalPerPublicationUniqueIssueNumbersSorted = computed(
      () =>
        totalPerPublicationUniqueIssueNumbers.value &&
        Object.entries(totalPerPublicationUniqueIssueNumbers.value).sort(
          ([publicationcode1], [publicationcode2]) =>
            Math.sign(
              totalPerPublicationUniqueIssueNumbers.value[publicationcode2]! -
                totalPerPublicationUniqueIssueNumbers.value[publicationcode1]!,
            ),
        ),
    ),
    popularIssuesInCollectionWithoutEdge = computed(
      () =>
        bookcase()
          .bookcaseWithPopularities?.filter(
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
        okForExchanges: user.value.marketplaceAcceptsExchanges || false,
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
        issues.value = await collectionServices.getIssues();
        isLoadingCollection.value = false;
      }
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
      sort,
      sinceLastVisit,
    }: {
      countryCode: string;
      sort: "score" | "oldestdate";
      sinceLastVisit: boolean;
    }) => {
      if (!isLoadingSuggestions.value) {
        isLoadingSuggestions.value = true;
        suggestions.value = await statsServices.getSuggestionsForCountry(
          countryCode || "ALL",
          sinceLastVisit ? "since_previous_visit" : "_",
          sort,
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
        popularIssuesInCollection.value = (
          await collectionServices.getCollectionPopularity()
        ).reduce(
          (acc, issue) => ({
            ...acc,
            [`${issue.country}/${issue.magazine} ${issue.issuenumber}`]:
              issue.popularity,
          }),
          {},
        );
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
      const response = await loginServices.login({
        username,
        password,
      });
      if (typeof response !== "string" && "error" in response) {
        onError(response.error!);
      } else {
        onSuccess(response as string);
      }
    },
    signup = async (
      username: string,
      password: string,
      password2: string,
      email: string,
      onSuccess: (token: string) => void,
      onError: (e: ScopedError) => void,
    ) => {
      const response = await collectionServices.createUser({
        username,
        password,
        password2,
        email,
      });
      if (response.error) {
        if (response.selector) {
          onError(response);
        } else {
          console.error(response.error, response.errorDetails);
        }
      } else {
        onSuccess(response.token);
      }
    },
    loadUser = async (afterUpdate = false) => {
      if (!isLoadingUser.value && (afterUpdate || !user.value)) {
        isLoadingUser.value = true;
        try {
          if (await sessionExistsFn()) {
            const response = await collectionServices.getUser();
            if ("error" in response) {
              throw new Error(response.error);
            } else {
              user.value = response;
            }
          }
        } catch (e) {
          console.error(e);
          await clearSessionFn();
          user.value = null;
        } finally {
          isLoadingUser.value = false;
        }
      }
    };
  return {
    ...collectionUtils,
    setApi: (params: {
      sessionExistsFn: typeof sessionExistsFn;
      clearSessionFn: typeof clearSessionFn;
    }) => {
      sessionExistsFn = params.sessionExistsFn;
      clearSessionFn = params.clearSessionFn;
    },
    issues,
    publicationUrlRoot,
    createPurchase,
    deletePurchase,
    hasSuggestions,
    issueNumbersPerPublication,
    lastPublishedEdgesForCurrentUser,
    loadCollection,
    loadLastPublishedEdgesForCurrentUser,
    loadMarketplaceContactMethods,
    loadPopularIssuesInCollection,
    loadPreviousVisit,
    loadPurchases,
    loadSubscriptions,
    loadSuggestions,
    loadUser,
    loadWatchedPublicationsWithSales,
    login,
    marketplaceContactMethods,
    popularIssuesInCollection,
    popularIssuesInCollectionWithoutEdge,
    previousVisit,
    purchases,
    purchasesById,
    signup,
    subscriptions,
    suggestions,
    totalPerPublicationUniqueIssueNumbers,
    totalPerPublicationUniqueIssueNumbersSorted,
    updateCollectionMultipleIssues,
    updateCollectionSingleIssue,
    updateMarketplaceContactMethods,
    updateWatchedPublicationsWithSales,
    user,
    userForAccountForm,
    watchedAuthors,
    watchedPublicationsWithSales,
  };
});
