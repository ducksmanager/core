import { AxiosInstance } from "axios";
import { defineStore } from "pinia";

import useCollection from "~/composables/useCollection";
import { GET__collection_public__$username } from "~api-routes";
import { addUrlParamsRequestInterceptor, call } from "~axios-helper";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

let api: AxiosInstance;

export const publicCollection = defineStore("publicCollection", () => {
  const collection = ref(null as IssueWithPublicationcode[] | null),
    purchases = ref([]);

  const collectionUtils = useCollection(collection),
    loadPublicCollection = async (username: string) => {
      collection.value = (
        await call(
          api,
          new GET__collection_public__$username({
            params: { username },
          }),
        )
      ).data.map((issue) => ({
        ...issue,
        publicationcode: `${issue.country}/${issue.magazine}`,
      }));
    };
  return {
    ...collectionUtils,
    setApi: (params: { api: typeof api }) => {
      api = addUrlParamsRequestInterceptor(params.api);
    },
    collection,
    purchases,
    loadPublicCollection,
    loadPurchases: () => {},
  };
});
