import { AxiosInstance } from "axios";

import useCollection from "~/composables/useCollection";
import { addUrlParamsRequestInterceptor, call } from "~axios-helper";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

let api: AxiosInstance;

export const publicCollection = defineStore("publicCollection", () => {
  const collection = ref(null as IssueWithPublicationcode[] | null),
    publicUsername = ref(null as string | null),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]);

  const collectionUtils = useCollection(collection),
    loadPublicCollection = async (username: string) => {
      publicUsername.value = username;
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
    publicationUrlRoot,
    collection,
    purchases,
    loadPublicCollection,
    loadPurchases: () => {},
  };
});
