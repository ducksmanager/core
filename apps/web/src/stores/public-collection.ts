import type { ShallowRef } from "vue";

import type { issue } from "~prisma-schemas/schemas/dm";

import useCollection from "../composables/useCollection";
import { socketInjectionKey } from "../composables/useDmSocket";

export const publicCollection = defineStore("publicCollection", () => {
  const { publicCollection: publicCollectionEvents } =
    inject(socketInjectionKey)!;

  const issues = shallowRef<(issue & { issuecode: string })[]>(),
    publicUsername = ref<string>(),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]);

  const collectionUtils = useCollection(
      issues as ShallowRef<(issue & { issuecode: string })[]>,
    ),
    loadPublicCollection = async (username: string) => {
      publicUsername.value = username;
      const data = await publicCollectionEvents.getPublicCollection(username);
      if (data.error) {
        console.error(data.error);
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
