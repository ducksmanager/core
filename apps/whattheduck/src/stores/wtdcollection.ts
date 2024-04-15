import { defineStore } from 'pinia';
import type { purchase } from '~prisma-clients/client_dm';
import { stores as webStores, composables as webComposables } from '~web';

import usePersistedData from '~/composables/usePersistedData';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';
import { SimpleIssue } from '~dm-types/SimpleIssue';
import { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const {
    coa: { services: coaServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const coaStore = webStores.coa();
  const webCollectionStore = webStores.collection();
  const { issues, purchases, user } = storeToRefs(webCollectionStore);
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(issues);

  const isDataLoaded = ref(false);

  const { findInCollection, loadCollection, loadPurchases, loadUser, login, signup } = webCollectionStore;

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
      coaStore.addPublicationNames(await coaServices.getFullPublicationList());
      await coaStore.fetchIssueCounts();
      await coaStore.fetchIssueNumbers(ownedPublications.value || []);
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
    isDataLoaded.value = true;
  });
  return {
    isDataLoaded,
    issues,
    fetchAndTrackCollection,
    findInCollection,
    getCollectionIssues,
    highestQuotedIssue,
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
    total: computed(() => webCollectionStore.total),
    totalPerCountry: computed(() => webCollectionStore.totalPerCountry),
    totalPerPublication: computed(() => webCollectionStore.totalPerPublication),
    totalUniqueIssues: computed(() => webCollectionStore.totalUniqueIssues),
    user,
  };
});

export type IssueWithCollectionIssues = SimpleIssue & {
  countrycode: string;
  countryname?: string;
  publicationName: string;
  collectionIssues: issueWithPublicationcode[];
};
