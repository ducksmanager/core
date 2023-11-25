import { AxiosInstance } from "axios";

import useCollection from "~/composables/useCollection";
import { addUrlParamsRequestInterceptor, call } from "~axios-helper";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

let api: AxiosInstance;

export const publicCollection = defineStore("publicCollection", () => {
  const issues = ref(null as IssueWithPublicationcode[] | null),
    publicUsername = ref(null as string | null),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]);

  const collectionUtils = useCollection(issues),
    loadPublicCollection = async (username: string) => {
      publicUsername.value = username;
      issues.value = (
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
    issues,
    purchases,
    loadPublicCollection,
    loadPurchases: () => {},
  };
});
