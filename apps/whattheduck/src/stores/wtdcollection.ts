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

  const {
    createPurchase,
    findInCollection,
    isLoadingSuggestions,
    loadCollection,
    loadPurchases,
    loadSuggestions,
    loadUserIssueQuotations,
    loadUser,
    login,
    updateCollectionSingleIssue,
    updateCollectionMultipleIssues,
  } = webCollectionStore;

  const {
    coaIssueCountsByPublicationcode,
    coaIssueCountsPerCountrycode,
    issues,
    issuesByIssuecode,
    numberPerCondition,
    purchases,
    purchasesById,
    suggestions,
    total,
    totalPerCountry,
    totalPerCountryWithoutDuplicates,
    totalPerPublication,
    totalPerPublicationWithoutDuplicates,
    totalUniqueIssues,
    user,
  } = storeToRefs(webCollectionStore);
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(
    issues as ShallowRef<(issue & { issuecode: string })[]>,
  );

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
    fetchCollection = async (force = false) => {
      await loadCollection(force);
      await loadPurchases(force);
      await loadUser(force);
      await coaStore.fetchCountryNames(true);
      await usersStore.fetchStats([webCollectionStore.user?.id || 0], force);
      // TODO retrieve user notification countries

      (async () => {
        await loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false });
        await statsStore.loadRatings();
        // TODO register for notifications
      })();
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
    coaIssueCountsByPublicationcode,
    coaIssueCountsPerCountrycode,
    createPurchase,
    fetchCollection,
    findInCollection,
    getCollectionIssues,
    highestQuotedIssue,
    isLoadingSuggestions,
    issues,
    issuesByIssuecode,
    loadCollection,
    loadPurchases,
    loadSuggestions,
    loadUserIssueQuotations,
    login,
    numberPerCondition,
    ownedCountries,
    ownedPublications,
    purchases,
    purchasesById,
    quotationSum,
    suggestions,
    total,
    totalPerCountry,
    totalPerCountryWithoutDuplicates,
    totalPerPublication,
    totalPerPublicationWithoutDuplicates,
    totalUniqueIssues,
    updateCollectionMultipleIssues,
    updateCollectionSingleIssue,
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
