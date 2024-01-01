import { authorUser } from "~prisma-clients/client_dm";
import {
  NamespaceEndpoint as CoaNamespaceEndpoint,
  Services as CoaServices,
} from "~services/coa/types";
import {
  NamespaceEndpoint as CollectionNamespaceEndpoint,
  Services as CollectionServices,
} from "~services/collection/types";
import { EventReturnType } from "~services/types";

const coaSocket = useSocket<CoaServices>(CoaNamespaceEndpoint);
const collectionSocket = useSocket<CollectionServices>(
  CollectionNamespaceEndpoint,
);

export const stats = defineStore("stats", () => {
  const ratings = ref(
    undefined as
      | EventReturnType<CollectionServices["getWatchedAuthors"]>
      | undefined,
  );
  const isSearching = ref(false as boolean);
  const isLoadingWatchedAuthors = ref(false as boolean);
  const authorSearchResults = ref(
    undefined as EventReturnType<CoaServices["searchAuthor"]> | undefined,
  );
  const pendingSearch = ref(null as string | null);

  const isAuthorWatched = (personcode: string) =>
    ratings.value?.some(
      ({ personcode: watchedPersonCode }) => personcode === watchedPersonCode,
    );

  const loadRatings = async (afterUpdate = false) => {
    if (afterUpdate || (!isLoadingWatchedAuthors.value && !ratings.value)) {
      isLoadingWatchedAuthors.value = true;
      ratings.value = await collectionSocket.emitWithAck("getWatchedAuthors");
      isLoadingWatchedAuthors.value = false;
    }
  };

  const searchAuthors = async (value: string) => {
    pendingSearch.value = value;
    if (!isSearching.value) {
      try {
        isSearching.value = true;
        authorSearchResults.value = await coaSocket.emitWithAck(
          "searchAuthor",
          value,
        );
        console.log(authorSearchResults.value);
      } finally {
        isSearching.value = false;
        // The input value has changed since the beginning of the search, searching again
        if (value !== pendingSearch.value)
          await searchAuthors(pendingSearch.value!);
      }
    }
  };

  const createRating = async (personcode: string) => {
    await collectionSocket.emitWithAck("addWatchedAuthor", personcode);
    await loadRatings(true);
  };
  const updateRating = async (data: authorUser) => {
    await collectionSocket.emitWithAck("updateWatchedAuthor", data);
  };
  const deleteAuthor = async (personcode: string) => {
    await collectionSocket.emitWithAck("deleteWatchedAuthor", personcode);
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
