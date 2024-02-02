import { defineStore } from 'pinia';
import type { purchase } from '~prisma-clients/client_dm';
import { stores as webStores, composables as webComposables } from '~web';


export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const coaStore = webStores.coa();
  const webCollectionStore = webStores.collection();
  const { issues } = storeToRefs(webCollectionStore);
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(issues);

  const ownedCountries = computed(() => [...new Set((issues.value || []).map(({ country }) => country))].sort()),
    ownedPublications = computed(() =>
      [...new Set((issues.value || []).map(({ publicationcode }) => publicationcode))].sort(),
    ),
    fetchAndTrackCollection = async () => {
      await webCollectionStore.loadCollection();
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
  return {
    issues: computed(() => webCollectionStore.issues),
    fetchAndTrackCollection,
    findInCollection: webCollectionStore.findInCollection,
    highestQuotedIssue,
    issuesByIssueCode: computed(() => webCollectionStore.issuesByIssueCode),
    loadCollection: webCollectionStore.loadCollection,
    loadPurchases: webCollectionStore.loadPurchases,
    loadUser: webCollectionStore.loadUser,
    login: webCollectionStore.login,
    numberPerCondition: computed(() => webCollectionStore.numberPerCondition),
    ownedCountries,
    ownedPublications,
    purchases: computed(() => webCollectionStore.purchases),
    purchasesById: computed(() => webCollectionStore.purchasesById),
    quotationSum,
    signup: webCollectionStore.signup,
    total: computed(() => webCollectionStore.total),
    totalPerCountry: computed(() => webCollectionStore.totalPerCountry),
    totalPerPublication: computed(() => webCollectionStore.totalPerPublication),
    totalUniqueIssues: computed(() => webCollectionStore.totalUniqueIssues),
    user: computed(() => webCollectionStore.user),
  };
});
