import { publicCollectionServices } from "~/composables/useSocket";
import { issueWithPublicationcode } from "~prisma-clients/extended/dm.extends";

import useCollection from "../composables/useCollection";

export const publicCollection = defineStore("publicCollection", () => {
  const issues = ref(null as issueWithPublicationcode[] | null),
    publicUsername = ref(null as string | null),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]);

  const collectionUtils = useCollection(issues),
    loadPublicCollection = async (username: string) => {
      publicUsername.value = username;
      const data = await publicCollectionServices.getPublicCollection(username);
      if (data.error) {
        console.error(data.error);
      } else {
        issues.value = data.issues.map((issue) => ({
          ...issue,
          publicationcode: `${issue.country}/${issue.magazine}`,
        }));
      }
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
