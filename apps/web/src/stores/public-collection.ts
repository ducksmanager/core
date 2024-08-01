import type { issue } from "~prisma-clients/schemas/dm";

import useCollection from "../composables/useCollection";
import { dmSocketInjectionKey } from "../composables/useDmSocket";

export const publicCollection = defineStore("publicCollection", () => {
  const {
    publicCollection: { services: publicCollectionServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const issues = shallowRef<issue[] | null>(null),
    publicUsername = ref<string | null>(null),
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
