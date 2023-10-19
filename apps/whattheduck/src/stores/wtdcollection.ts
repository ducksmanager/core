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
    collection: webCollectionStore.collection,
    setApi: webCollectionStore.setApi,
    loadCollection: webCollectionStore.loadCollection,
    issuesByIssueCode: webCollectionStore.issuesByIssueCode,
    total: webCollectionStore.total,
    totalPerCountry: webCollectionStore.totalPerCountry,
    totalPerPublication: webCollectionStore.totalPerPublication,
    ownedCountries,
    ownedPublications,
    fetchAndTrackCollection,
  };
});
