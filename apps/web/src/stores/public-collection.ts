import useCollection from "../composables/useCollection";
import { socketInjectionKey } from "../composables/useDmSocket";
import { EventOutput } from "socket-call-client";
import type { ClientEvents as PublicCollectionServices } from "~dm-services/public-collection";

export const publicCollection = defineStore("publicCollection", () => {
  const { publicCollection: publicCollectionEvents } =
    inject(socketInjectionKey)!;

  const issues =
      shallowRef<
        EventOutput<PublicCollectionServices, "getPublicCollection">["issues"]
      >(),
    publicUsername = ref<string>(),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]),
    labels = ref([]),
    labelIdFilters = new Set<number>();

  const collectionUtils = useCollection(issues),
    loadPublicCollection = async (username: string) => {
      publicUsername.value = username;
      const data = await publicCollectionEvents.getPublicCollection(username);
      if (data.error) {
        console.error(data.error);
      }
      issues.value = data.issues;
    };
  return {
    ...collectionUtils,
    publicationUrlRoot,
    issues,
    labels,
    labelIdFilters,
    purchases,
    loadPublicCollection,
    loadLabels: () => {},
    loadPurchases: () => {},
  };
});
