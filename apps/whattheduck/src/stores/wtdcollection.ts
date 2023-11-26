import { defineStore } from 'pinia';
import type { IssueWithPublicationcode } from '~dm-types/IssueWithPublicationcode';
import type { purchase } from '~prisma-clients/client_dm';
import { stores as webStores, composables as webComposables } from '~web';

import { app } from './app';

import { User } from '~/persistence/models/dm/User';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const issues = ref(null as IssueWithPublicationcode[] | null);

  const coaStore = webStores.coa();
  const webCollectionStore = webStores.collection();
  const statsStore = webStores.stats();
  const usersStore = webStores.users();
  const { quotedIssues, quotationSum } = webComposables.useCollection(issues);

  const ownedCountries = computed(() => [...new Set((issues.value || []).map(({ country }) => country))].sort()),
    ownedPublications = computed(() =>
      [...new Set((issues.value || []).map(({ publicationcode }) => publicationcode))].sort(),
    ),
    fetchAndTrackCollection = async () => {
      const isObsoleteSync = await app().isObsoleteSync();
      try {
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
    },
    highestQuotedIssue = computed(
      () => quotedIssues.value?.sort((a, b) => b.estimationGivenCondition - a.estimationGivenCondition)[0],
    );
  return {
    collection: computed(() => webCollectionStore.issues),
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
    setApi: webCollectionStore.setApi,
    signup: webCollectionStore.signup,
    total: computed(() => webCollectionStore.total),
    totalPerCountry: computed(() => webCollectionStore.totalPerCountry),
    totalPerPublication: computed(() => webCollectionStore.totalPerPublication),
    totalUniqueIssues: computed(() => webCollectionStore.totalUniqueIssues),
    user: computed(() => webCollectionStore.user),
  };
});
