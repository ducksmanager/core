import { AxiosInstance } from "axios";
import { Socket } from "socket.io-client";

import { Services as CoaServices } from "~api/services/coa/types";
import { Services as StatsServices } from "~api/services/stats/types";
import { addUrlParamsRequestInterceptor, call } from "~axios-helper";

import { EventReturnType } from "../../../../packages/api/services/types";

let api: AxiosInstance;
let socket: Socket<StatsServices>;

export const stats = defineStore("stats", () => {
  const ratings = ref(
    undefined as
      | EventReturnType<StatsServices["getWatchedAuthorsStats"]>
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
      ratings.value = await socket.emitWithAck("getWatchedAuthorsStats");
      isLoadingWatchedAuthors.value = false;
    }
  };

  const searchAuthors = async (value: string) => {
    pendingSearch.value = value;
    if (!isSearching.value) {
      try {
        isSearching.value = true;
        authorSearchResults.value = await coa()
          .getSocket()
          .emitWithAck("searchAuthor", value);
        console.log(authorSearchResults.value);
      } finally {
        isSearching.value = false;
        // The input value has changed since the beginning of the search, searching again
        if (value !== pendingSearch.value)
          await searchAuthors(pendingSearch.value!);
      }
    }
  };

  const createRating = async (data: { personcode: string }) => {
    await call(
      api,
      new PUT__collection__authors__watched({
        reqBody: data,
      }),
    );
    await loadRatings(true);
  };
  const updateRating = async (data: {
    personcode: string;
    notation: number;
  }) => {
    await call(api, new POST__collection__authors__watched({ reqBody: data }));
  };
  const deleteAuthor = async (data: { personcode: string }) => {
    await call(
      api,
      new DELETE__collection__authors__watched({ reqBody: data }),
    );
    await loadRatings(true);
  };

  return {
    setApi: (params: { api: typeof api }) => {
      api = addUrlParamsRequestInterceptor(params.api);
    },
    setSocket: (params: { socket: typeof socket }) => {
      socket = params.socket;
    },
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
