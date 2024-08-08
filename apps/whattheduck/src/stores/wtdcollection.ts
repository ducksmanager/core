import { defineStore } from 'pinia';
import type { ShallowRef } from 'vue';
import type { IssueWithIssuecodeOnly, PartInfo } from '~dm-types/SimpleIssue';
import type { purchase, issue } from '~prisma-schemas/schemas/dm';
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
  const { quotedIssues, quotationSum } = webComposables.useCollection(issues as ShallowRef<issue[]>);

  const isPersistedDataLoaded = ref(false);

  const {
    createPurchase,
    findInCollection,
    fetchIssueCountsByPublicationcode,
    loadCollection,
    loadPurchases,
    loadUserIssueQuotations,
    loadUser,
    login,
    signup,
    updateCollectionSingleIssue,
    updateCollectionMultipleIssues,
  } = webCollectionStore;

  const ownedCountries = computed(() =>
      ownedPublications.value
        ? [...new Set((ownedPublications.value || []).map((publicationcode) => publicationcode.split('/')[0]))].sort()
        : ownedPublications.value,
    ),
    ownedPublications = computed(() =>
      issues.value
        ? [...new Set((issues.value || []).map(({ publicationcode }) => publicationcode))].sort()
        : issues.value,
    ),
    fetchAndTrackCollection = async () => {
      await loadCollection();
      await loadPurchases();
      await loadUser();
      // TODO retrieve user notification countries

      // TODO get app version
      await webCollectionStore.loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false });
      await statsStore.loadRatings();
      await webCollectionStore.fetchIssueCountsByCountrycode();
      await webCollectionStore.fetchIssueCountsByPublicationcode();
      await usersStore.fetchStats([webCollectionStore.user?.id || 0]);

      await coaStore.fetchCountryNames(true);
      coaStore.addPublicationNames(await webCollectionStore.fetchPublicationNames());
      // TODO register for notifications
    },
    highestQuotedIssue = computedAsync(async () => {
      const issue = quotedIssues.value?.sort((a, b) => b.estimationGivenCondition - a.estimationGivenCondition)[0];
      if (issue) {
        await coa().fetchIssuecodeDetails([issue.issuecode]);
        return { ...issue, ...coa().issuecodeDetails[issue.issuecode] };
      }
      return issue;
    }),
    getCollectionIssues = (issuecode: string) =>
      issues.value!.filter(({ issuecode: collectionIssuecode }) => collectionIssuecode === issuecode);

  usePersistedData({ user, issues }).then(() => {
    isPersistedDataLoaded.value = true;
  });
  return {
    isPersistedDataLoaded,
    issues,
    createPurchase,
    fetchAndTrackCollection,
    fetchIssueCountsByPublicationcode,
    findInCollection,
    getCollectionIssues,
    highestQuotedIssue,
    coaIssueCountsByPublicationcode: computed(() => webCollectionStore.coaIssueCountsByPublicationcode),
    coaIssueCountsPerCountrycode: computed(() => webCollectionStore.coaIssueCountsPerCountrycode),
    issuesByIssuecode: computed(() => webCollectionStore.issuesByIssuecode),
    loadCollection,
    loadUserIssueQuotations,
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
    updateCollectionMultipleIssues,
    user,
  };
});

export type IssueWithCollectionIssues = IssueWithIssuecodeOnly & {
  countrycode: string;
  countryname?: string;
  publicationName: string;
  collectionIssues?: issue[];
  partInfo?: PartInfo;
};
