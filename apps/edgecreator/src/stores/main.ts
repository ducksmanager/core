import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { userContributionType } from "~prisma-schemas/schemas/dm";
import type { ModelContributor } from "~types/ModelContributor";
import type { SimpleUser } from "~types/SimpleUser";
import { stores as webStores } from "~web";

import { edgeCatalog } from "./edgeCatalog";

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});
export const main = defineStore("main", () => {
  const { browse: browseEvents } = inject(edgecreatorSocketInjectionKey)!;

  const publicationcode = ref<string>(),
    issuecodes = ref<string[]>([]),
    isRange = ref(false),
    photoUrls = ref<Record<string, string>>({}),
    contributors = ref<ModelContributor[]>([]),
    publicationElements = ref<string[]>([]),
    publicationPhotos = ref<string[]>([]),
    warnings = ref<string[]>([]),
    country = computed(() => publicationcode.value?.split("/")[0]),
    magazine = computed(() => publicationcode.value?.split("/")[1]),
    publicationIssues = computed(
      () =>
        (publicationcode.value &&
          publicationcode.value in webStores.coa().issuesByPublicationcode &&
          webStores.coa().issuesByPublicationcode[publicationcode.value]) ||
        undefined,
    ),
    publicationElementsForGallery = computed(
      () =>
        country.value &&
        publicationElements.value.map((elementFileName) => ({
          name: elementFileName,
          url: `${
            import.meta.env.VITE_EDGES_URL as string
          }/${country.value!}/elements/${elementFileName}`,
        })),
    ),
    publicationPhotosForGallery = computed(
      () =>
        country.value &&
        publicationPhotos.value.map((elementFileName) => ({
          name: elementFileName,
          url: `${
            import.meta.env.VITE_EDGES_URL as string
          }/${country.value!}/photos/${elementFileName}`,
        })),
    ),
    addContributor = ({
      issuecode,
      contributionType,
      user,
    }: {
      issuecode: string;
      contributionType: userContributionType;
      user: SimpleUser;
    }) => {
      removeContributor({ contributionType, userToRemove: user });
      contributors.value.push({
        issuecode,
        contributionType,
        user,
      });
    },
    removeContributor = ({
      contributionType,
      userToRemove,
    }: {
      contributionType: userContributionType;
      userToRemove: SimpleUser;
    }) => {
      contributors.value = contributors.value.filter(
        ({ contributionType: thisContributionType, user: thisUser }) =>
          thisContributionType !== contributionType &&
          thisUser.id !== userToRemove.id,
      );
    },
    addWarning = (warning: string) => {
      warnings.value = [...warnings.value, warning];
    },
    removeWarning = (idx: number) => {
      warnings.value.splice(idx, 1);
    },
    setIssuecodes = (
      firstIssuecode: string,
      lastIssuecode?: string,
      otherIssuecodes?: string[],
    ) => {
      if (!publicationIssues.value) {
        console.error("Publication issues not loaded");
        return;
      }
      const firstIssueIndex = publicationIssues.value.findIndex(
        ({ issuecode }) => issuecode === firstIssuecode,
      );
      if (lastIssuecode === undefined) {
        issuecodes.value = [firstIssuecode, ...(otherIssuecodes || [])];
      } else {
        isRange.value = true;
        let lastIssueIndex = publicationIssues.value.findIndex(
          ({ issuecode }) => issuecode === lastIssuecode,
        );
        if (lastIssueIndex === -1) {
          lastIssueIndex = publicationIssues.value.length - 1;
          console.warn(
            `Issue ${lastIssuecode} doesn't exist, falling back to ${publicationIssues.value[lastIssueIndex]}`,
          );
        }

        issuecodes.value = publicationIssues.value
          .filter(
            (_, index) => index >= firstIssueIndex && index <= lastIssueIndex,
          )
          .map(({ issuecode }) => issuecode);
      }
    },
    loadItems = async ({ itemType }: { itemType: "elements" | "photos" }) => {
      const items = (
        await browseEvents.listEdgeParts({
          imageType: itemType,
          country: country.value!,
          magazine: magazine.value!,
        })
      ).results!.sort((a, b) => numericSortCollator.compare(a, b));
      if (itemType === "elements") {
        publicationElements.value = items;
      } else {
        publicationPhotos.value = items;
      }
    },
    loadPublicationIssues = async () =>
      webStores.coa().fetchIssuesByPublicationcode(publicationcode.value!),
    getEdgePublicationStates = (issuecodes: string[]) =>
      Object.keys(edgeCatalog().publishedEdges)
        .filter((issuecode) => issuecodes.includes(issuecode))
        .sort((issuecode1, issuecode2) =>
          Math.sign(
            issuecodes.indexOf(issuecode1) - issuecodes.indexOf(issuecode2),
          ),
        );

  const firstIssueIndex = computed(() =>
    publicationIssues.value?.findIndex(
      ({ issuecode }) => issuecode === issuecodes.value[0],
    ),
  );
  const lastIssueIndex = computed(() =>
    publicationIssues.value?.findIndex(
      ({ issuecode }) =>
        issuecode === issuecodes.value[issuecodes.value.length - 1],
    ),
  );

  const edgeIssuecodesBefore = computed(() => {
    if (
      !edgeCatalog().ongoingEdges ||
      !publicationcode.value ||
      !publicationIssues.value ||
      !(publicationcode.value in edgeCatalog().publishedEdges)
    ) {
      return [];
    }
    const issuesBefore = publicationIssues.value.filter(
      (_, index) =>
        firstIssueIndex.value !== -1 &&
        index >= firstIssueIndex.value! - 10 &&
        index < firstIssueIndex.value!,
    );

    return getEdgePublicationStates(
      issuesBefore.map(({ issuecode }) => issuecode),
    );
  });

  const edgeIssuecodesAfter = computed(() => {
    if (
      !edgeCatalog().ongoingEdges ||
      !publicationcode.value ||
      !publicationIssues.value ||
      !(publicationcode.value in edgeCatalog().publishedEdges)
    ) {
      return [];
    }
    const issuesAfter = publicationIssues.value.filter(
      (_, index) =>
        lastIssueIndex.value !== -1 &&
        index > lastIssueIndex.value! &&
        index <= lastIssueIndex.value! + 10,
    );

    return getEdgePublicationStates(
      issuesAfter.map(({ issuecode }) => issuecode),
    );
  });
  return {
    publicationcode,
    issuecodes,
    isRange,
    photoUrls,
    contributors,
    edgeIssuecodesBefore,
    edgeIssuecodesAfter,
    publicationElements,
    publicationPhotos,
    warnings,
    publicationIssues,
    publicationElementsForGallery,
    publicationPhotosForGallery,
    addContributor,
    removeContributor,
    addWarning,
    removeWarning,
    setIssuecodes,
    loadItems,
    loadPublicationIssues,
  };
});
