import { AxiosInstance } from "axios";

import {
  GET__coa__authorsfullnames__search__$partialAuthorName,
  GET__collection__authors__watched,
} from "~api-routes/index";
import { addUrlParamsRequestInterceptor, call } from "~axios-helper";

let api: AxiosInstance;
export const stats = defineStore("stats", () => {
  const ratings = ref(
    undefined as GET__collection__authors__watched["resBody"] | undefined,
  );
  const isSearching = ref(false as boolean);
  const isLoadingWatchedAuthors = ref(false as boolean);
  const authorSearchResults = ref(
    undefined as
      | GET__coa__authorsfullnames__search__$partialAuthorName["resBody"]
      | undefined,
  );
  const pendingSearch = ref(null as string | null);

  const isAuthorWatched = (personcode: string) =>
    ratings.value?.some(
      ({ personcode: watchedPersonCode }) => personcode === watchedPersonCode,
    );

  const loadRatings = async (afterUpdate = false) => {
    if (afterUpdate || (!isLoadingWatchedAuthors.value && !ratings.value)) {
      isLoadingWatchedAuthors.value = true;
      ratings.value = (
        await call(api, new GET__collection__authors__watched())
      ).data;
      isLoadingWatchedAuthors.value = false;
    }
  };

  const searchAuthors = async (value: string) => {
    pendingSearch.value = value;
    if (!isSearching.value) {
      try {
        isSearching.value = true;
        authorSearchResults.value = (
          await call(
            api,
            new GET__coa__authorsfullnames__search__$partialAuthorName({
              params: {
                partialAuthorName: value,
              },
            }),
          )
        ).data;
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
