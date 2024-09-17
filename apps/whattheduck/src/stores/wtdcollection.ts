import { defineStore } from 'pinia';
import type { ShallowRef } from 'vue';
import type { EntryPartInfo } from '~dm-types/EntryPartInfo';
import type { IssueWithIssuecodeOnly } from '~dm-types/IssueWithIssuecodeOnly';
import type { issue, purchase } from '~prisma-schemas/schemas/dm';
import { composables as webComposables, stores as webStores } from '~web';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const coaStore = webStores.coa();
  const webCollectionStore = webStores.collection();
  const { issues, purchases, user } = storeToRefs(webCollectionStore);
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(
    issues as ShallowRef<(issue & { issuecode: string })[]>,
  );

  const {
    createPurchase,
    findInCollection,
    fetchIssueCountsByCountrycode,
    fetchIssueCountsByPublicationcode,
    isLoadingSuggestions,
    loadCollection,
    loadPurchases,
    loadSuggestions,
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
      await coaStore.fetchCountryNames(true);
      coaStore.addPublicationNames(await webCollectionStore.fetchPublicationNames());
      await usersStore.fetchStats([webCollectionStore.user?.id || 0]);
      // TODO retrieve user notification countries

      await fetchIssueCountsByCountrycode();
      await fetchIssueCountsByPublicationcode();

      // TODO get app version
      (async () => {
        await loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false });
        await statsStore.loadRatings();
      })();

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

  return {
    issues,
    createPurchase,
    fetchAndTrackCollection,
    fetchIssueCountsByPublicationcode,
    findInCollection,
    getCollectionIssues,
    highestQuotedIssue,
    coaIssueCountsByPublicationcode: computed(() => webCollectionStore.coaIssueCountsByPublicationcode),
    coaIssueCountsPerCountrycode: computed(() => webCollectionStore.coaIssueCountsPerCountrycode),
    isLoadingSuggestions,
    issuesByIssuecode: computed(() => webCollectionStore.issuesByIssuecode),
    loadCollection,
    loadSuggestions,
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
  partInfo?: EntryPartInfo;
};
