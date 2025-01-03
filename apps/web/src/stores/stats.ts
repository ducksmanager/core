import type { ClientEvents as CoaServices } from "~dm-services/coa";
import type { ClientEvents as CollectionServices } from "~dm-services/collection";
import type { authorUser } from "~prisma-schemas/schemas/dm";
import type { EventOutput } from "~socket.io-services/index";

import { socketInjectionKey } from "../composables/useDmSocket";

export const stats = defineStore("stats", () => {
  const {
    coa: { services: coaServices },
    collection: { services: collectionServices },
  } = inject(socketInjectionKey)!;

  const ratings =
    shallowRef<EventOutput<CollectionServices, "getWatchedAuthors">>();
  const isSearching = ref(false);
  const isLoadingWatchedAuthors = ref(false);
  const authorSearchResults =
    shallowRef<EventOutput<CoaServices, "searchAuthor">>();
  const pendingSearch = ref<string>();

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
