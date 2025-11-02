import type { ShallowRef } from "vue";

import type { issue } from "~prisma-schemas/schemas/dm";

import useCollection from "../composables/useCollection";
import { socketInjectionKey } from "../composables/useDmSocket";
import { EventOutput } from "socket-call-client";
import type { ClientEvents as CollectionServices } from "~dm-services/collection";

export const publicCollection = defineStore("publicCollection", () => {
  const { publicCollection: publicCollectionEvents } =
    inject(socketInjectionKey)!;

  const issues = shallowRef<EventOutput<CollectionServices, "getIssues">>(),
    publicUsername = ref<string>(),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]),
    labels = ref([]),
    labelIdFilters = new Set<number>();

  const collectionUtils = useCollection(
      issues as ShallowRef<(issue & { issuecode: string })[]>,
    ),
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
