import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import {
  NamespaceEndpoint as PublicCollectionNamespaceEndpoint,
  Services as PublicCollectionServices,
} from "~services/public-collection/types";

import useCollection from "../composables/useCollection";

const services = useSocket<PublicCollectionServices>(
  PublicCollectionNamespaceEndpoint,
);

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
      issues.value = (await services.getPublicCollection(username)).map(
        (issue) => ({
          ...issue,
          publicationcode: `${issue.country}/${issue.magazine}`,
        }),
      );
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
