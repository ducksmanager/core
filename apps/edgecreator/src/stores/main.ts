import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { contribution } from "~prisma-schemas/schemas/edgecreator";
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
    contributors = ref<Set<ModelContributor>>(new Set()),
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
    publicationIssuecodes = computed(() =>
      publicationIssues.value?.map(({ issuecode }) => issuecode),
    ),
    publicationPublishedEdges = computed(
      () =>
        publicationcode.value &&
        edgeCatalog().publishedEdges?.[publicationcode.value],
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
      contributionType: contribution;
      user: SimpleUser;
    }) => {
      contributors.value.add({
        issuecode,
        contributionType,
        user,
      });
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
      otherIssuecodes: string[] = [],
    ) => {
      if (!publicationIssuecodes.value) {
        console.error("Publication issues not loaded");
        return;
      }
      const errors: string[] = [];
      const firstIssueIndex =
        publicationIssuecodes.value.indexOf(firstIssuecode);
      if (!lastIssuecode) {
        issuecodes.value = [firstIssuecode, ...otherIssuecodes];
      } else {
        isRange.value = true;

        let lastIssueIndex = publicationIssuecodes.value.indexOf(lastIssuecode);
        if (lastIssueIndex === -1) {
          errors.push(`Issue ${lastIssuecode} doesn't exist`);
          lastIssueIndex = firstIssueIndex;
        }

        issuecodes.value = publicationIssuecodes.value.filter(
          (_, index) => index >= firstIssueIndex && index <= lastIssueIndex,
        );
      }

      const { existing, nonExisting } = Object.groupBy(
        issuecodes.value,
        (issuecode) =>
          publicationIssuecodes.value!.includes(issuecode)
            ? "existing"
            : "nonExisting",
      );
      issuecodes.value = existing || [];
      for (const nonExistingIssue of nonExisting || []) {
        errors.push(`Issue ${nonExistingIssue} doesn't exist, ignoring`);
      }

      return errors;
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
      webStores.coa().fetchIssuesByPublicationcode(publicationcode.value),
    getEdgePublicationStates = (issuecodes: string[]) =>
      Object.keys(publicationPublishedEdges.value || {})
        .filter((issuecode) => issuecodes.includes(issuecode))
        .sort((issuecode1, issuecode2) =>
          Math.sign(
            issuecodes.indexOf(issuecode1) - issuecodes.indexOf(issuecode2),
          ),
        );

  const edgeIssuecodesBefore = computed(() => {
    if (
      !edgeCatalog().ongoingEdges ||
      !publicationcode.value ||
      !publicationIssuecodes.value?.length ||
      !(publicationPublishedEdges.value || {})
    ) {
      return [];
    }
    const firstIssueIndex = publicationIssuecodes.value.indexOf(
      issuecodes.value[0],
    );
    const issuesBefore = publicationIssuecodes.value.filter(
      (_, index) =>
        firstIssueIndex !== -1 &&
        index >= firstIssueIndex - 10 &&
        index < firstIssueIndex,
    );

    return getEdgePublicationStates(issuesBefore);
  });

  const edgeIssuecodesAfter = computed(() => {
    if (
      !edgeCatalog().ongoingEdges ||
      !publicationcode.value ||
      !publicationIssuecodes.value ||
      !publicationPublishedEdges.value
    ) {
      return [];
    }

    const lastIssueIndex = publicationIssuecodes.value?.indexOf(
      issuecodes.value[issuecodes.value.length - 1],
    );
    const issuesAfter = publicationIssuecodes.value.filter(
      (_, index) =>
        lastIssueIndex !== -1 &&
        index > lastIssueIndex &&
        index <= lastIssueIndex + 10,
    );

    return getEdgePublicationStates(issuesAfter);
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
    publicationPublishedEdges,
    publicationIssues,
    publicationIssuecodes,
    publicationElementsForGallery,
    publicationPhotosForGallery,
    addContributor,
    addWarning,
    removeWarning,
    setIssuecodes,
    loadItems,
    loadPublicationIssues,
  };
});
