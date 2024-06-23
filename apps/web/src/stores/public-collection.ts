import { issue } from "~prisma-clients/extended/dm.extends";

import useCollection from "../composables/useCollection";
import { dmSocketInjectionKey } from "../composables/useDmSocket";

export const publicCollection = defineStore("publicCollection", () => {
  const {
    publicCollection: { services: publicCollectionServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const issues = ref(null as issue[] | null),
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
