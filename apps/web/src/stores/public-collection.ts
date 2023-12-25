import { Socket } from "socket.io-client";

import { Services as PublicCollectionServices } from "~api/services/public-collection/types";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

import useCollection from "../composables/useCollection";

let socket: Socket<PublicCollectionServices>;

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
        await socket.emitWithAck("getPublicCollection", username)
      ).map((issue) => ({
        ...issue,
        publicationcode: `${issue.country}/${issue.magazine}`,
      }));
    };
  return {
    ...collectionUtils,
    setSocket: (params: { socket: typeof socket }) => {
      socket = params.socket;
    },
    publicationUrlRoot,
    issues,
    purchases,
    loadPublicCollection,
    loadPurchases: () => {},
  };
});
