import { defineStore } from 'pinia';

import type { EntryPartInfo } from '~dm-types/EntryPartInfo';
import type { IssueWithIssuecodeOnly } from '~dm-types/IssueWithIssuecodeOnly';
import type { issue, purchase } from '~prisma-schemas/schemas/dm';
import useCollection from '~web/src/composables/useCollection';
import { coa } from '~web/src/stores/coa';
import { collection } from '~web/src/stores/collection';
import { stats } from '~web/src/stores/stats';
import { users } from '~web/src/stores/users';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const coaStore = coa();
  const webCollectionStore = collection();

  const {
    createPurchase,
    deletePurchase,
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
  const statsStore = stats();
  const usersStore = users();
  const { quotedIssues, quotationSum } = useCollection(issues);

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
    highestQuotedIssue = computedAsync(
      async () => {
        const issue = quotedIssues.value?.sort((a, b) => b.estimationGivenCondition - a.estimationGivenCondition)[0];
        if (issue) {
          await coaStore.fetchIssuecodeDetails([issue.issuecode]);
          return { ...issue, ...coaStore.issuecodeDetails[issue.issuecode] };
        }
        return issue;
      },
      undefined,
      { flush: 'post' },
    ),
    getCollectionIssues = (issuecode: string) =>
      issues.value!.filter(({ issuecode: collectionIssuecode }) => collectionIssuecode === issuecode);

  return {
    createPurchase,
    deletePurchase,
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
