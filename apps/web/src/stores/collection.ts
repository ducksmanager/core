import type { EventOutput, SuccessfulEventOutput } from "socket-call-client";
import type { ShallowRef } from "vue";

import type { ClientEvents as CollectionServices } from "~dm-services/collection";
import type { SubscriptionTransformedStringDates } from "~dm-services/collection/subscriptions";
import type { ClientEvents as StatsServices } from "~dm-services/stats";
import type {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";
import type {
  authorUser,
  label,
  purchase,
  subscription,
} from "~prisma-schemas/schemas/dm";
import {
  ON_SALE_LABEL_DESCRIPTION,
  TO_READ_LABEL_DESCRIPTION,
} from "~dm-types/Labels";

import useCollection from "../composables/useCollection";
import { socketInjectionKey } from "../composables/useDmSocket";

export type Filter =
  | typeof ON_SALE_LABEL_DESCRIPTION
  | typeof TO_READ_LABEL_DESCRIPTION
  | (string & {});

export type IssueWithPublicationcodeOptionalId = Omit<
  EventOutput<CollectionServices, "getIssues">[number],
  "id" | "title" | "publicationcode" | "issuenumber"
> & {
  id: number | null;
};

export type purchaseWithStringDate = Omit<purchase, "date"> & {
  date: string;
};

// The cache key of a socket call includes its arguments, so passing
// `{ disableCache: false }` would store the response under a different key than
// the one a cache-enabled call reads from.
const cacheControl = (ignoreCache: boolean) =>
  (ignoreCache ? [{ disableCache: true }] : []) as [{ disableCache: boolean }];

export const collection = defineStore("collection", () => {
  const route = useRoute<
    "/collection/user/[username]/[[...all]]" | "/bookcase/show/[username]"
  >();
  const {
    collection: collectionEvents,
    stats: statsEvents,
    auth: authEvents,
    options: socketOptions,
  } = inject(socketInjectionKey)!;

  const issues = shallowRef<EventOutput<CollectionServices, "getIssues">>();

  const labelFiltersQueryParams =
    useUrlSearchParams<Record<Filter, "true">>("hash-params");

  const collectionUtils = useCollection(
      issues as ShallowRef<EventOutput<CollectionServices, "getIssues">>,
    ),
    watchedPublicationsWithSales = shallowRef<string[]>(),
    purchases = shallowRef<purchase[]>(),
    labels = shallowRef<label[]>(),
    labelIdFilters = computed(
      () =>
        new Set(
          Object.entries(labelFiltersQueryParams)
            .filter(([, value]) => value === "true")
            .map(
              ([labelDescription]) =>
                labels.value?.find(
                  ({ description }) => description === labelDescription,
                )?.id,
            )
            .filter((id) => id !== undefined),
        ) as Set<number>,
    ),
    watchedAuthors = shallowRef<authorUser[]>(),
    marketplaceContactMethods = ref<string[]>(),
    suggestions =
      shallowRef<EventOutput<StatsServices, "getSuggestionsForCountry">>(),
    subscriptions = shallowRef<subscription[]>(),
    popularIssuesInCollection = ref<{
      [issuecode: string]: number;
    }>(),
    lastPublishedEdgesForCurrentUser =
      shallowRef<EventOutput<CollectionServices, "getLastPublishedEdges">>(),
    isLoadingUser = ref(false),
    isLoadingCollection = ref(false),
    isLoadingWatchedPublicationsWithSales = ref(false),
    isLoadingMarketplaceContactMethods = ref(false),
    isLoadingPurchases = ref(false),
    isLoadingLabels = ref(false),
    isLoadingSuggestions = ref(false),
    isLoadingSubscriptions = ref(false),
    user = shallowRef<
      SuccessfulEventOutput<CollectionServices, "getUser"> | undefined | null
    >(),
    isPublicCollection = computed(() => route.params.username !== undefined),
    userPermissions =
      shallowRef<EventOutput<CollectionServices, "getUserPermissions">>(),
    previousVisit = ref<Date>(),
    publicationUrlRoot = computed(() => "/collection/show"),
    purchasesById = computed(() => purchases.value?.groupBy("id")),
    copiesPerIssuecode = computed(() =>
      issues.value?.groupBy("issuecode", "[]"),
    ),
    hasSuggestions = computed(
      () => Object.keys(suggestions.value?.oldestdate || {}).length,
    ),
    issuecodesPerPublication = computed(
      () => issues.value?.groupBy("publicationcode", "[]") || {},
    ),
    totalPerPublicationUniqueIssuecodes = computed(() =>
      Object.fromEntries(
        Object.entries(issuecodesPerPublication.value).map(
          ([publicationcode, issuecodes]) => [
            publicationcode,
            new Set(issuecodes).size,
          ],
        ),
      ),
    ),
    totalPerPublicationUniqueIssuecodesSorted = computed(() =>
      Object.entries(totalPerPublicationUniqueIssuecodes.value).sort(
        ([publicationcode1], [publicationcode2]) =>
          Math.sign(
            totalPerPublicationUniqueIssuecodes.value[publicationcode2] -
              totalPerPublicationUniqueIssuecodes.value[publicationcode1],
          ),
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
        email: user.value.email,
        marketplaceAcceptsExchanges:
          user.value.marketplaceAcceptsExchanges || false,
      };
    }),
    labelsWithIcons = computed(() =>
      labels.value?.map(({ id, userId, description }) => ({
        id,
        description,
        userId,
      })),
    ),
    updateCollectionSingleIssue = async (data: CollectionUpdateSingleIssue) => {
      await collectionEvents.addOrChangeCopies(data);
      await loadCollection(true);
    },
    updateCollectionMultipleIssues = async (
      data: CollectionUpdateMultipleIssues,
    ) => {
      await collectionEvents.addOrChangeIssues(data);
      await loadCollection(true);
    },
    createPurchase = async (date: string, description: string) => {
      await collectionEvents.createPurchase(date, description);
      await loadPurchases(true);
    },
    deletePurchase = async (id: number) => {
      await collectionEvents.deletePurchase(id);
      await loadPurchases(true);
    },
    createLabel = async (description: string) => {
      await collectionEvents.createLabel(description);
      await loadLabels(true);
    },
    deleteLabel = async (description: string) => {
      await collectionEvents.deleteLabel(description);
      await loadLabels(true);
    },
    loadPreviousVisit = () =>
      collectionEvents
        .getLastVisit()
        .then((response) => {
          if (response) {
            previousVisit.value = new Date(response);
          }
        })
        .catch((e) => {
          console.error(e.error);
          return null;
        }),
    loadCollection = async (ignoreCache = false) => {
      if (ignoreCache || (!isLoadingCollection.value && !issues.value)) {
        isLoadingCollection.value = true;
        issues.value = await collectionEvents.getIssues(
          ...cacheControl(ignoreCache),
        );

        const collectionPublicationcodes = [
          ...new Set(
            issues.value
              .map(({ publicationcode }) => publicationcode)
              .filter((publicationcode) => !!publicationcode),
          ),
        ];
        const collectionCountrycodes = [
          ...new Set(
            collectionPublicationcodes.map(
              (publicationcode) => publicationcode.split("/")[0],
            ),
          ),
        ];

        await coa().fetchIssueCountsByCountrycode(collectionCountrycodes);
        await coa().fetchIssueCountsByPublicationcode(
          collectionPublicationcodes,
        );
        await coa().fetchPublicationNames(collectionPublicationcodes);
      } else {
        issues.value = await collectionEvents.getIssues(
          ...cacheControl(ignoreCache),
        );
      }

      coa().issuecodeDetails = {
        ...toRaw(coa().issuecodeDetails),
        ...issues.value
          .map(({ issuecode, publicationcode, issuenumber }) => ({
            issuecode,
            publicationcode,
            issuenumber,
          }))
          .groupBy("issuecode"),
      };
      isLoadingCollection.value = false;
    },
    loadPurchases = async (ignoreCache = false) => {
      if (ignoreCache || (!isLoadingPurchases.value && !purchases.value)) {
        isLoadingPurchases.value = true;
        purchases.value = (
          await collectionEvents.getPurchases(...cacheControl(ignoreCache))
        ).map((purchase) => ({
          ...purchase,
          date: new Date(purchase.date),
        }));
        isLoadingPurchases.value = false;
      }
    },
    loadLabels = async (ignoreCache = false) => {
      if (ignoreCache || (!isLoadingLabels.value && !labels.value)) {
        isLoadingLabels.value = true;
        labels.value = await collectionEvents.getLabels(
          ...cacheControl(ignoreCache),
        );
        isLoadingLabels.value = false;
      }
    },
    loadWatchedPublicationsWithSales = async (ignoreCache = false) => {
      if (
        ignoreCache ||
        (!isLoadingWatchedPublicationsWithSales.value &&
          !watchedPublicationsWithSales.value)
      ) {
        isLoadingWatchedPublicationsWithSales.value = true;
        watchedPublicationsWithSales.value = await collectionEvents.getOption(
          "sales_notification_publications",
          ...cacheControl(ignoreCache),
        );
        isLoadingWatchedPublicationsWithSales.value = false;
      }
    },
    loadMarketplaceContactMethods = async (ignoreCache = false) => {
      if (
        ignoreCache ||
        (!isLoadingMarketplaceContactMethods.value &&
          !marketplaceContactMethods.value)
      ) {
        isLoadingMarketplaceContactMethods.value = true;
        marketplaceContactMethods.value = await collectionEvents.getOption(
          "marketplace_contact_methods",
          ...cacheControl(ignoreCache),
        );
        isLoadingMarketplaceContactMethods.value = false;
      }
    },
    updateMarketplaceContactMethods = async () =>
      await collectionEvents.getOption("marketplace_contact_methods"),
    updateWatchedPublicationsWithSales = async () => {
      await collectionEvents.setOption(
        "sales_notification_publications",
        watchedPublicationsWithSales.value!,
      );
    },
    loadSuggestions = async ({
      countryCode,
      sinceLastVisit,
    }: {
      countryCode: string;
      sinceLastVisit: boolean;
    }) => {
      if (!isLoadingSuggestions.value) {
        isLoadingSuggestions.value = true;
        suggestions.value = await statsEvents.getSuggestionsForCountry(
          countryCode || "ALL",
          sinceLastVisit ? "since_previous_visit" : "_",
          sinceLastVisit ? 100 : 20,
        );
        isLoadingSuggestions.value = false;
      }
    },
    loadSubscriptions = async (ignoreCache = false) => {
      if (
        ignoreCache ||
        (!isLoadingSubscriptions.value && !subscriptions.value)
      ) {
        isLoadingSubscriptions.value = true;
        subscriptions.value = (
          await collectionEvents.getSubscriptions(...cacheControl(ignoreCache))
        ).map((subscription: SubscriptionTransformedStringDates) => ({
          ...subscription,
          startDate: new Date(Date.parse(subscription.startDate)),
          endDate: new Date(Date.parse(subscription.endDate)),
        }));
        isLoadingSubscriptions.value = false;
      }
    },
    loadPopularIssuesInCollection = async () => {
      if (!popularIssuesInCollection.value) {
        popularIssuesInCollection.value =
          await collectionEvents.getCollectionPopularity();
      }
    },
    loadUserIssueQuotations = async () => {
      coa().addIssueQuotations(
        await collectionEvents.getCollectionQuotations(),
      );
    },
    loadLastPublishedEdgesForCurrentUser = async () => {
      if (!lastPublishedEdgesForCurrentUser.value) {
        lastPublishedEdgesForCurrentUser.value =
          await collectionEvents.getLastPublishedEdges();
      }
    },
    login = async (
      username: string,
      password: string,
      onSuccess: (token: string) => void,
      onError: (e: string) => void,
    ) => {
      const token = await authEvents
        .login({
          username,
          password,
        })
        .catch((e) => {
          onError(e.error);
        });
      if (typeof token === "string") {
        onSuccess(token);
      }
    },
    loadUser = async (ignoreCache = false) => {
      if (!(await socketOptions.session.getToken())) {
        user.value = null;
        return;
      }
      if (!isLoadingUser.value && (ignoreCache || !user.value)) {
        isLoadingUser.value = true;
        try {
          user.value = await collectionEvents.getUser(
            ...cacheControl(ignoreCache),
          );
        } catch (e) {
          console.error(e);
          socketOptions.session.clearSession();
          user.value = null;
        } finally {
          isLoadingUser.value = false;
        }
      }
    },
    loadUserPermissions = async () => {
      userPermissions.value = await collectionEvents.getUserPermissions();
    },
    hasRole = (thisPrivilege: string) =>
      userPermissions.value?.some(
        ({ privilege, role }) =>
          role === "EdgeCreator" && privilege === thisPrivilege,
      ) || false;

  return {
    ...collectionUtils,
    issues,
    publicationUrlRoot,
    createLabel,
    createPurchase,
    deleteLabel,
    deletePurchase,
    hasRole,
    hasSuggestions,
    isLoadingUser,
    copiesPerIssuecode,
    isLoadingSuggestions,
    isPublicCollection,
    issuecodesPerPublication,
    labelIdFilters,
    labelFiltersQueryParams,
    labels,
    labelsWithIcons,
    lastPublishedEdgesForCurrentUser,
    loadCollection,
    loadUserIssueQuotations,
    loadLabels,
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
