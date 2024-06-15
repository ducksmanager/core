import { defineStore } from 'pinia';
import type { SimpleIssue } from '~dm-types/SimpleIssue';
import type { purchase } from '~prisma-clients/client_dm';
import type { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';
import { stores as webStores, composables as webComposables } from '~web';

import usePersistedData from '~/composables/usePersistedData';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const coaStore = webStores.coa();
  const webCollectionStore = webStores.collection();
  const { issues, purchases, user } = storeToRefs(webCollectionStore);
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(issues);

  const isPersistedDataLoaded = ref(false);

  const {
    findInCollection,
    fetchIssueCountsByPublicationcode,
    loadCollection,
    loadPurchases,
    loadUser,
    login,
    signup,
    updateCollectionSingleIssue,
  } = webCollectionStore;

  const ownedCountries = computed(() =>
      issues.value ? [...new Set((issues.value || []).map(({ country }) => country))].sort() : issues.value,
    ),
    ownedPublications = computed(() =>
      issues.value
        ? [...new Set((issues.value || []).map(({ publicationcode }) => publicationcode))].sort()
        : issues.value,
    ),
    fetchAndTrackCollection = async () => {
      await loadCollection();
      await coaStore.fetchCountryNames(true);
      await loadPurchases();
      await loadUser();
      // TODO retrieve user points
      // TODO retrieve user notification countries

      // TODO get app version
      await webCollectionStore.loadSuggestions({
        countryCode: 'ALL',
        sinceLastVisit: false,
        sort: 'score',
      });
      await webCollectionStore.loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false, sort: 'oldestdate' });
      await statsStore.loadRatings();
      await webCollectionStore.fetchIssueCountsByCountrycode();
      await webCollectionStore.fetchIssueCountsByPublicationcode();
      coaStore.addPublicationNames(await webCollectionStore.fetchPublicationNames());
      await usersStore.fetchStats([webCollectionStore.user?.id || 0]);
      // TODO register for notifications
    },
    highestQuotedIssue = computed(
      () => quotedIssues.value?.sort((a, b) => b.estimationGivenCondition - a.estimationGivenCondition)[0],
    ),
    getCollectionIssues = (publicationcode: string, issuenumber: string) =>
      issues.value!.filter(
        ({ publicationcode: collectionPublicationCode, issuenumber: collectionIssueNumber }) =>
          collectionPublicationCode === publicationcode && collectionIssueNumber === issuenumber,
      );

  usePersistedData({ user, issues }).then(() => {
    isPersistedDataLoaded.value = true;
  });
  return {
    isPersistedDataLoaded,
    issues,
    fetchAndTrackCollection,
    fetchIssueCountsByPublicationcode,
    findInCollection,
    getCollectionIssues,
    highestQuotedIssue,
    coaIssueCountsByPublicationcode: computed(() => webCollectionStore.coaIssueCountsByPublicationcode),
    coaIssueCountsPerCountrycode: computed(() => webCollectionStore.coaIssueCountsPerCountrycode),
    issuesByIssueCode: computed(() => webCollectionStore.issuesByIssueCode),
    loadCollection,
    loadPurchases,
    login,
    numberPerCondition: computed(() => webCollectionStore.numberPerCondition),
    ownedCountries,
    ownedPublications,
    purchases,
    purchasesById: computed(() => webCollectionStore.purchasesById),
    quotationSum,
    signup,
    suggestions: computed(() => webCollectionStore.suggestions),
    total: computed(() => webCollectionStore.total),
    totalPerCountry: computed(() => webCollectionStore.totalPerCountry),
    totalPerPublication: computed(() => webCollectionStore.totalPerPublication),
    totalUniqueIssues: computed(() => webCollectionStore.totalUniqueIssues),
    updateCollectionSingleIssue,
    user,
  };
});

export type IssueWithCollectionIssues = SimpleIssue & {
  countrycode: string;
  countryname?: string;
  publicationName: string;
  collectionIssues?: issueWithPublicationcode[];
};
