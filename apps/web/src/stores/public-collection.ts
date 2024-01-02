import { publicCollectionServices } from "~/composables/useSocket";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

import useCollection from "../composables/useCollection";

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
        await publicCollectionServices.getPublicCollection(username)
      ).map((issue) => ({
        ...issue,
        publicationcode: `${issue.country}/${issue.magazine}`,
      }));
    };
  return {
    ...collectionUtils,
    publicationUrlRoot,
    issues,
    purchases,
    loadPublicCollection,
    loadPurchases: () => {},
  };
});
