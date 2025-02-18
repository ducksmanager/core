import type { issue } from "~prisma-schemas/schemas/dm";

import useCollection from "../composables/useCollection";

export const publicCollection = defineStore("publicCollection", () => {
  const issues = shallowRef<(issue & { issuecode: string })[]>(),
    publicUsername = ref<string>(),
    publicationUrlRoot = computed(
      () => `/collection/user/${publicUsername.value || ""}`,
    ),
    purchases = ref([]);

  const collectionUtils = useCollection(issues),
    loadPublicCollection = async (username: string) =>
      collectionUtils.loadCollection(username);

  return {
    ...collectionUtils,
    publicationUrlRoot,
    issues,
    purchases,
    loadPublicCollection,
    loadPurchases: () => {},
  };
});
