import type CoaServices from "~dm-services/coa/types";
import type CollectionServices from "~dm-services/collection/types";
import type { authorUser } from "~prisma-schemas/schemas/dm";
import type { EventReturnType } from "~socket.io-services/types";

import { socketInjectionKey } from "../composables/useDmSocket";

export const stats = defineStore("stats", () => {
  const {
    coa: { services: coaServices },
    collection: { services: collectionServices },
  } = inject(socketInjectionKey)!;

  const ratings = shallowRef<
    EventReturnType<CollectionServices["getWatchedAuthors"]> | undefined
  >(undefined);
  const isSearching = ref(false);
  const isLoadingWatchedAuthors = ref(false);
  const authorSearchResults = shallowRef<
    EventReturnType<CoaServices["searchAuthor"]> | undefined
  >(undefined);
  const pendingSearch = ref<string | null>(null);

  const isAuthorWatched = (personcode: string) =>
    ratings.value?.some(
      ({ personcode: watchedPersonCode }) => personcode === watchedPersonCode,
    );

  const loadRatings = async (afterUpdate = false) => {
    if (afterUpdate || (!isLoadingWatchedAuthors.value && !ratings.value)) {
      isLoadingWatchedAuthors.value = true;
      ratings.value = await collectionServices.getWatchedAuthors();
      isLoadingWatchedAuthors.value = false;
    }
  };

  const searchAuthors = async (value: string) => {
    pendingSearch.value = value;
    if (!isSearching.value) {
      try {
        isSearching.value = true;
        authorSearchResults.value = await coaServices.searchAuthor(value);
      } finally {
        isSearching.value = false;
        // The input value has changed since the beginning of the search, searching again
        if (value !== pendingSearch.value)
          await searchAuthors(pendingSearch.value!);
      }
    }
  };

  const createRating = async (personcode: string) => {
    await collectionServices.addWatchedAuthor(personcode);
    await loadRatings(true);
  };
  const updateRating = async (data: authorUser) => {
    await collectionServices.updateWatchedAuthor(data);
  };
  const deleteAuthor = async (personcode: string) => {
    await collectionServices.deleteWatchedAuthor(personcode);
    await loadRatings(true);
  };

  return {
    isAuthorWatched,
    isSearching,
    ratings,
    pendingSearch,
    searchAuthors,
    authorSearchResults,
    loadRatings,
    createRating,
    updateRating,
    deleteAuthor,
  };
});
