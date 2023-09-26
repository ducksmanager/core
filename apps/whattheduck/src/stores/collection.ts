import { defineStore } from 'pinia';
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import {
  DELETE__collection__purchases__$id,
  GET__collection__authors__watched,
  GET__collection__edges__lastPublished,
  GET__collection__issues,
  GET__collection__popular,
  GET__collection__purchases,
  GET__collection__stats__suggestedissues__$countrycode__$sincePreviousVisit__$sort__$limit,
  GET__collection__user,
  POST__collection__issues__multiple,
  POST__collection__issues__single,
  POST__collection__lastvisit,
  PUT__collection__purchases,
} from '~api-routes';
import { call } from '~axios-helper';
import type { CollectionUpdateMultipleIssues, CollectionUpdateSingleIssue } from '~dm-types/CollectionUpdate';
import type { issue, authorUser, purchase, subscription, user } from '~prisma-clients/client_dm';
import { stores } from '~web';

import { app } from './app';

import { SuggestedIssueSimple } from '~/persistence/models/composite/SuggestedIssueSimple';
import { AuthorUser } from '~/persistence/models/dm/AuthorUser';
import { Issue } from '~/persistence/models/dm/Issue';
import { IssuePopularity } from '~/persistence/models/dm/IssuePopularity';
import { Purchase } from '~/persistence/models/dm/Purchase';
import { User } from '~/persistence/models/dm/User';
import { defaultApi } from '~/util/api';

export type IssueWithPublicationcode = issue & {
  publicationcode: string;
};

export type IssueWithPublicationcodeOptionalId = Omit<IssueWithPublicationcode, 'id'> & {
  id: number | null;
};

export type SubscriptionTransformed = Omit<subscription, 'country' | 'magazine'> & {
  publicationcode: string;
};

export type purchaseWithStringDate = Omit<purchase, 'date'> & {
  date: string;
};

export const collection = defineStore('collection', () => {
  const bookcaseStore = stores.bookcase();
  const coaStore = stores.coa();

  const isLoading = ref({} as Record<string, boolean>),
    collection = ref(null as Issue[] | null),
    watchedPublicationsWithSales = ref(null as string[] | null),
    purchases = ref(null as Purchase[] | null),
    watchedAuthors = ref(null as authorUser[] | null),
    marketplaceContactMethods = ref(null as string[] | null),
    suggestions = ref(null as SuggestedIssueSimple[] | null),
    subscriptions = ref(null as SubscriptionTransformed[] | null),
    popularIssueInCollection = ref(null as IssuePopularity[] | null),
    lastPublishedEdgesForCurrentUser = ref(null as GET__collection__edges__lastPublished['resBody'] | null),
    isLoadingUser = ref(false as boolean),
    user = ref(undefined as Omit<user, 'password'> | undefined | null),
    previousVisit = ref(null as Date | null),
    popularIssueInCollectionByIssuecode = computed(() =>
      popularIssueInCollection.value?.reduce(
        (acc, issue) => ({
          ...acc,
          [`${issue.country}/${issue.magazine} ${issue.issuenumber}`]: issue.popularity,
        }),
        {} as Record<string, number>,
      ),
    ),
    total = computed(() => collection.value?.length),
    ownedCountries = computed(() => [...new Set((collection.value || []).map(({ country }) => country))].sort()),
    ownedPublications = computed(() =>
      [...new Set((collection.value || []).map(({ publicationcode }) => publicationcode))].sort(),
    ),
    issuesByIssueCode = computed((): Record<string, Issue[]> | undefined =>
      collection.value?.reduce((acc, issue) => {
        const issuecode = `${issue.publicationcode} ${issue.issuenumber}`;
        return {
          ...acc,
          [issuecode]: [...(acc[issuecode] || []), issue],
        };
      }, {} as Record<string, Issue[]>),
    ),
    duplicateIssues = computed(
      (): {
        [issuecode: string]: IssueWithPublicationcode[];
      } =>
        (issuesByIssueCode.value &&
          Object.keys(issuesByIssueCode.value).reduce(
            (acc, issuecode) =>
              issuesByIssueCode.value![issuecode].length > 1
                ? {
                    ...acc,
                    [issuecode]: issuesByIssueCode.value![issuecode],
                  }
                : acc,
            {},
          )) ||
        {},
    ),
    issuesInToReadStack = computed(() => collection.value?.filter(({ isToRead }) => isToRead)),
    // issuesInOnSaleStack = computed(() => collection.value?.filter(({ isOnSale }) => isOnSale)),
    totalUniqueIssues = computed(
      () =>
        (duplicateIssues.value &&
          (!collection.value?.length
            ? 0
            : collection.value?.length -
              Object.values(duplicateIssues.value).reduce(
                (acc, duplicatedIssue) => acc + duplicatedIssue.length - 1,
                0,
              ))) ||
        0,
    ),
    totalPerCountry = computed(() =>
      collection.value?.reduce(
        (acc, issue) => ({
          ...acc,
          [issue.country]: (acc[issue.country] || 0) + 1,
        }),
        {} as { [countrycode: string]: number },
      ),
    ),
    totalPerPublication = computed(
      () =>
        collection.value?.reduce((acc, issue) => {
          const publicationcode = `${issue.country}/${issue.magazine}`;
          return { ...acc, [publicationcode]: (acc[publicationcode] || 0) + 1 };
        }, {} as { [publicationcode: string]: number }) || null,
    ),
    purchasesById = computed(() =>
      purchases.value?.reduce((acc, purchase) => ({ ...acc, [purchase.id]: purchase }), {}),
    ),
    hasSuggestions = computed(() => suggestions.value?.length),
    issueNumbersPerPublication = computed(
      () =>
        collection.value?.reduce(
          (acc, { country, issuenumber, magazine }) => ({
            ...acc,
            [`${country}/${magazine}`]: [...(acc[`${country}/${magazine}`] || []), issuenumber],
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
            [publicationcode]: [...new Set(issueNumbersPerPublication.value[publicationcode])].length,
          }),
          {},
        ),
    ),
    totalPerPublicationUniqueIssueNumbersSorted = computed(
      () =>
        totalPerPublicationUniqueIssueNumbers.value &&
        Object.entries(totalPerPublicationUniqueIssueNumbers.value).sort(([publicationcode1], [publicationcode2]) =>
          Math.sign(
            totalPerPublicationUniqueIssueNumbers.value[publicationcode2]! -
              totalPerPublicationUniqueIssueNumbers.value[publicationcode1]!,
          ),
        ),
    ),
    popularIssuesInCollectionWithoutEdge = computed(() =>
      bookcaseStore.bookcaseWithPopularities
        ?.filter(({ edgeId, popularity }) => !edgeId && popularity && popularity > 0)
        .sort(({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 && popularity1 ? popularity2 - popularity1 : 0,
        ),
    ),
    quotedIssues = computed(() => {
      const issueQuotations = coaStore.issueQuotations;
      if (issueQuotations === null) {
        return null;
      }
      const getEstimation = (publicationcode: string, issuenumber: string) => {
        const estimationData = issueQuotations[`${publicationcode} ${issuenumber}`];
        return (
          (estimationData &&
            (estimationData.max ? ((estimationData.min || 0) + estimationData.max) / 2 : estimationData.min)) ||
          0
        );
      };
      const CONDITION_TO_ESTIMATION_PCT: Record<string, number> = {
        bon: 1,
        moyen: 0.7,
        mauvais: 0.3,
        indefini: 0.7,
        '': 0.7,
      };
      return (
        collection.value
          ?.filter(({ publicationcode, issuenumber }) => getEstimation(publicationcode, issuenumber))
          .map(({ publicationcode, issuenumber, condition }) => {
            const estimation = getEstimation(publicationcode, issuenumber);
            return {
              publicationcode,
              issuenumber,
              condition,
              estimation,
              estimationGivenCondition: parseFloat((CONDITION_TO_ESTIMATION_PCT[condition] * estimation).toFixed(1)),
            };
          }) || null
      );
    }),
    quotationSum = computed(() =>
      quotedIssues.value
        ? Math.round(
            quotedIssues.value?.reduce((acc, { estimationGivenCondition }) => acc + estimationGivenCondition, 0) || 0,
          )
        : null,
    ),
    // userForAccountForm = computed(() => {
    //   if (!user.value) {
    //     return null;
    //   }
    //   return {
    //     ...user.value,
    //     discordId: user.value.discordId || undefined,
    //     presentationText: user.value.presentationText || '',
    //     email: user.value.email!,
    //     okForExchanges: user.value.marketplaceAcceptsExchanges || false,
    //   };
    // }),
    updateCollectionSingleIssue = async (data: CollectionUpdateSingleIssue) => {
      await call(
        defaultApi,
        new POST__collection__issues__single({
          reqBody: data,
        }),
      );
      await loadCollection(true);
    },
    updateCollectionMultipleIssues = async (data: CollectionUpdateMultipleIssues) => {
      await call(
        defaultApi,
        new POST__collection__issues__multiple({
          reqBody: data,
        }),
      );
      await loadCollection(true);
    },
    createPurchase = async (date: string, description: string) => {
      await call(
        defaultApi,
        new PUT__collection__purchases({
          reqBody: { date, description },
        }),
      );
      await loadPurchases(true);
    },
    deletePurchase = async (id: number) => {
      await call(
        defaultApi,
        new DELETE__collection__purchases__$id({
          params: { id: String(id) },
        }),
      );
      await loadPurchases(true);
    },
    findInCollection = (publicationcode: string, issuenumber: string) =>
      collection.value?.find(
        ({ country, magazine, issuenumber: collectionIssueNumber }) =>
          publicationcode === `${country}/${magazine}` && collectionIssueNumber === issuenumber,
      ),
    loadPreviousVisit = async () => {
      previousVisit.value = (await call(defaultApi, new POST__collection__lastvisit())).data?.previousVisit;
    },
    loadCollection = async (afterUpdate = false) => {
      await load<GET__collection__issues['resBody'], Issue>(
        'collection',
        Issue,
        async () => await call(defaultApi, new GET__collection__issues()),
        (value) =>
          value.map((issue) => ({
            ...issue,
            publicationcode: `${issue.country}/${issue.magazine}`,
          })),
        collection,
        afterUpdate,
      );
    },
    loadPurchases = async (afterUpdate = false) => {
      await load<GET__collection__purchases['resBody'], Purchase>(
        'purchases',
        Purchase,
        async () => await call(defaultApi, new GET__collection__purchases()),
        (value) =>
          value.map(({ id, description, date }) => ({
            id,
            description,
            date: new Date(Date.parse(date)),
          })),
        purchases,
        afterUpdate,
      );
    },
    loadWatchedAuthors = async (afterUpdate = false) => {
      await load<GET__collection__authors__watched['resBody'], AuthorUser>(
        'watchedAuthors',
        AuthorUser,
        async () => await call(defaultApi, new GET__collection__authors__watched()),
        (value) => value,
        watchedAuthors,
        afterUpdate,
      );
    },
    /*loadWatchedPublicationsWithSales = async (afterUpdate = false) => {
      if (afterUpdate || (!isLoadingWatchedPublicationsWithSales.value && !watchedPublicationsWithSales.value)) {
        isLoadingWatchedPublicationsWithSales.value = true;
        watchedPublicationsWithSales.value = (
          await call(
            defaultApi,
            new GET__collection__options__$optionName({
              params: {
                optionName: 'sales_notification_publications',
              },
            })
          )
        ).data;
        isLoadingWatchedPublicationsWithSales.value = false;
      }
    },
    loadMarketplaceContactMethods = async (afterUpdate = false) => {
      if (afterUpdate || (!isLoadingMarketplaceContactMethods.value && !marketplaceContactMethods.value)) {
        isLoadingMarketplaceContactMethods.value = true;
        marketplaceContactMethods.value = (
          await call(
            defaultApi,
            new GET__collection__options__$optionName({
              params: { optionName: 'marketplace_contact_methods' },
            })
          )
        ).data;
        isLoadingMarketplaceContactMethods.value = false;
      }
    },
    updateMarketplaceContactMethods = async () =>
      await call(
        defaultApi,
        new POST__collection__options__$optionName({
          reqBody: { values: marketplaceContactMethods.value! },
          params: {
            optionName: 'marketplace_contact_methods',
          },
        })
      ),
    updateWatchedPublicationsWithSales = async () =>
      await call(
        defaultApi,
        new POST__collection__options__$optionName({
          reqBody: {
            values: watchedPublicationsWithSales.value!,
          },
          params: {
            optionName: 'sales_notification_publications',
          },
        })
      ),*/
    load = async <AxiosResponseType, Entity extends ObjectLiteral>(
      name: string,
      model: EntityTarget<Entity>,
      axiosCall: () => Promise<{ data: AxiosResponseType }>,
      axiosResponseToStore: (responseData: AxiosResponseType) => Entity[],
      ref: Ref<Entity[] | null>,
      afterUpdate = false,
      noFetchIfNonObsoleteSync = false,
    ): Promise<void> => {
      if (afterUpdate || (!isLoading.value[name] && !ref.value)) {
        isLoading.value[name] = true;
        if ((noFetchIfNonObsoleteSync && !(await app().isObsoleteSync())) || app().isOfflineMode) {
          ref.value = await app().dbInstance.getRepository(model).find();
        } else {
          ref.value = axiosResponseToStore((await axiosCall()).data);
          await app().dbInstance.getRepository(model).clear();
          const data = ref.value;
          if (data !== null) {
            await app().dbInstance.getRepository(model).save<Entity>(data);
          }
        }
        isLoading.value[name] = false;
      }
    },
    loadSuggestions = async (
      {
        countryCode,
        sort,
        sinceLastVisit,
      }: {
        countryCode: string;
        sort: 'oldestdate' | 'score';
        sinceLastVisit: boolean;
      },
      afterUpdate = false,
    ) => {
      await load(
        'suggestions',
        SuggestedIssueSimple,
        async () =>
          await call(
            defaultApi,
            new GET__collection__stats__suggestedissues__$countrycode__$sincePreviousVisit__$sort__$limit({
              reqBody: {
                countrycode: countryCode || 'ALL',
                sincePreviousVisit: sinceLastVisit ? 'since_previous_visit' : '_',
                sort,
                limit: sinceLastVisit ? 100 : 20,
              },
            }),
          ),
        (value) =>
          Object.values(value.issues).map(({ stories, ...issue }) => ({
            ...issue,
            storiesList: Object.keys(stories).join(', '),
          })),
        suggestions,
        afterUpdate,
        true,
      );
    },
    // loadSubscriptions = async (afterUpdate = false) => {
    //   if (afterUpdate || (!isLoadingSubscriptions.value && !subscriptions.value)) {
    //     isLoadingSubscriptions.value = true;
    //     subscriptions.value = (await call(defaultApi, new GET__collection__subscriptions())).data.map(
    //       (subscription: SubscriptionTransformedStringDates) => ({
    //         ...subscription,
    //         publicationcode: '',
    //         startDate: new Date(Date.parse(subscription.startDate)),
    //         endDate: new Date(Date.parse(subscription.endDate)),
    //       })
    //     );
    //     isLoadingSubscriptions.value = false;
    //   }
    // },
    loadPopularIssuesInCollection = async () => {
      await load<GET__collection__popular['resBody'], IssuePopularity>(
        'issuePopularities',
        IssuePopularity,
        async () => await call(defaultApi, new GET__collection__popular()),
        (value) => value,
        popularIssueInCollection,
      );
    },
    loadLastPublishedEdgesForCurrentUser = async () => {
      if (!lastPublishedEdgesForCurrentUser.value) {
        lastPublishedEdgesForCurrentUser.value = (
          await call(defaultApi, new GET__collection__edges__lastPublished())
        ).data;
      }
    },
    loadUser = async (afterUpdate = false) => {
      if (!isLoadingUser.value && (afterUpdate || !user.value)) {
        isLoadingUser.value = true;
        try {
          user.value = (await call(defaultApi, new GET__collection__user())).data;
        } catch (e) {
          console.error(e);
          user.value = null;
          throw e;
        } finally {
          isLoadingUser.value = false;
        }
      }
    },
    fetchAndTrackCollection = async () => {
      const isObsoleteSync = await app().isObsoleteSync();
      try {
        await loadUser();
        await loadCollection();
        // TODO retrieve user points
        // TODO retrieve user notification countries

        // TODO get app version
        await loadSuggestions(
          {
            countryCode: 'ALL',
            sinceLastVisit: false,
            sort: 'score',
          },
          true,
        );
        await loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false, sort: 'oldestdate' }, true);
        await coaStore.fetchCountryNames(true);
        await coaStore.fetchPublicationNames(['ALL']);
        await coaStore.fetchIssueCounts();
        await coaStore.fetchIssueNumbers(ownedPublications.value || []);

        // TODO register for notifications
      } catch (e) {
        console.error(e);
        switch ((e as AxiosError).response?.status) {
          case 404:
            if (isObsoleteSync) {
              app().isOfflineMode = true;
            }
            break;
          case 401:
            await app().dbInstance.getRepository(User).clear();
            throw new Error('Unauthorized');
          default: // Alert error
        }
      }
    };
  return {
    collection,
    watchedPublicationsWithSales,
    purchases,
    watchedAuthors,
    marketplaceContactMethods,
    suggestions,
    subscriptions,
    popularIssueInCollectionByIssuecode,
    lastPublishedEdgesForCurrentUser,
    user,
    previousVisit,
    total,
    issuesByIssueCode,
    duplicateIssues,
    issuesInToReadStack,
    // issuesInOnSaleStack,
    totalUniqueIssues,
    totalPerCountry,
    totalPerPublication,
    purchasesById,
    hasSuggestions,
    issueNumbersPerPublication,
    totalPerPublicationUniqueIssueNumbers,
    totalPerPublicationUniqueIssueNumbersSorted,
    popularIssuesInCollectionWithoutEdge,
    quotedIssues,
    quotationSum,
    // userForAccountForm,
    updateCollectionSingleIssue,
    updateCollectionMultipleIssues,
    createPurchase,
    deletePurchase,
    findInCollection,
    load,
    loadPreviousVisit,
    loadCollection,
    loadPurchases,
    loadWatchedAuthors,
    // loadWatchedPublicationsWithSales,
    // loadMarketplaceContactMethods,
    // updateMarketplaceContactMethods,
    // updateWatchedPublicationsWithSales,
    loadSuggestions,
    // loadSubscriptions,
    loadPopularIssuesInCollection,
    loadLastPublishedEdgesForCurrentUser,
    loadUser,
    ownedCountries,
    ownedPublications,
    fetchAndTrackCollection,
  };
});
