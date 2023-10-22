import { defineStore } from 'pinia';
import type { purchase } from '~prisma-clients/client_dm';
import { stores as webStores } from '~web';

import { app } from './app';

import { User } from '~/persistence/models/dm/User';

export type purchaseWithStringDate = Omit<purchase, 'date' | 'userId'> & {
  date: string;
};

export const wtdcollection = defineStore('wtdcollection', () => {
  const coaStore = webStores.coa();
  const statsStore = webStores.stats();
  const webCollectionStore = webStores.collection();

  const ownedCountries = computed(() =>
      [...new Set((webCollectionStore.collection || []).map(({ country }) => country))].sort(),
    ),
    ownedPublications = computed(() =>
      [...new Set((webCollectionStore.collection || []).map(({ publicationcode }) => publicationcode))].sort(),
    ),
    fetchAndTrackCollection = async () => {
      const isObsoleteSync = await app().isObsoleteSync();
      try {
        await webCollectionStore.loadUser();
        await webCollectionStore.loadCollection();
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
    collection: computed(() => webCollectionStore.collection),
    purchases: computed(() => webCollectionStore.purchases),
    user: computed(() => webCollectionStore.user),
    issuesByIssueCode: computed(() => webCollectionStore.issuesByIssueCode),
    total: computed(() => webCollectionStore.total),
    totalPerCountry: computed(() => webCollectionStore.totalPerCountry),
    totalPerPublication: computed(() => webCollectionStore.totalPerPublication),
    setApi: webCollectionStore.setApi,
    loadUser: webCollectionStore.loadUser,
    loadCollection: webCollectionStore.loadCollection,
    loadPurchases: webCollectionStore.loadPurchases,
    signup: webCollectionStore.signup,
    login: webCollectionStore.login,
    ownedCountries,
    ownedPublications,
    fetchAndTrackCollection,
  };
});
