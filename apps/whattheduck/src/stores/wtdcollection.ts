import { defineStore } from 'pinia';
import type { purchase } from '~prisma-clients/client_dm';
import { stores as webStores, composables as webComposables } from '~web';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const coaStore = webStores.coa();
  const webCollectionStore = webStores.collection();
  const { issues, purchases } = storeToRefs(webCollectionStore);
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(issues);

  const isDataLoaded = ref(false)

  const {
    findInCollection,
    loadCollection,
    loadPurchases,
    loadUser,
    login,
    signup,
  } = webCollectionStore

  const ownedCountries = computed(() => [...new Set((issues.value || []).map(({ country }) => country))].sort()),
    ownedPublications = computed(() =>
      [...new Set((issues.value || []).map(({ publicationcode }) => publicationcode))].sort(),
    ),
    fetchAndTrackCollection = async () => {
      await loadCollection();
      await loadUser();
      // TODO retrieve user points
      // TODO retrieve user notification countries

      // TODO get app version
      //await webCollectionStore.loadSuggestions({
      //  countryCode: 'ALL',
      //  sinceLastVisit: false,
      //  sort: 'score',
      //});
      //await webCollectionStore.loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false, sort: 'oldestdate' });
      await statsStore.loadRatings();
      await coaStore.fetchCountryNames(true);
      await coaStore.fetchPublicationNames(['ALL']);
      await coaStore.fetchIssueCounts();
      await coaStore.fetchIssueNumbers(ownedPublications.value || []);
      await usersStore.fetchStats([webCollectionStore.user?.id || 0]);

      // TODO register for notifications
    },
    highestQuotedIssue = computed(
      () => quotedIssues.value?.sort((a, b) => b.estimationGivenCondition - a.estimationGivenCondition)[0],
    );

  // usePersistedData({ issues }).then(() => {
    isDataLoaded.value = true
  // })
  return {
    isDataLoaded,
    issues,
    fetchAndTrackCollection,
    findInCollection,
    highestQuotedIssue,
    issuesByIssueCode: computed(() => webCollectionStore.issuesByIssueCode),
    loadCollection,
    loadPurchases,
    loadUser,
    login,
    numberPerCondition: computed(() => webCollectionStore.numberPerCondition),
    ownedCountries,
    ownedPublications,
    purchases,
    purchasesById: computed(() => webCollectionStore.purchasesById),
    quotationSum,
    signup,
    total: computed(() => webCollectionStore.total),
    totalPerCountry: computed(() => webCollectionStore.totalPerCountry),
    totalPerPublication: computed(() => webCollectionStore.totalPerPublication),
    totalUniqueIssues: computed(() => webCollectionStore.totalUniqueIssues),
    user: computed(() => webCollectionStore.user),
  };
});
