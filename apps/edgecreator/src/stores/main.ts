import type { AxiosInstance } from "axios";
import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { EdgeWithModelIdAndInducksData } from "~dm-types/EdgeWithModelIdAndInducksData";
import type { userContributionType } from "~prisma-schemas/schemas/dm";
import type { ModelContributor } from "~types/ModelContributor";
import type { SimpleUser } from "~types/SimpleUser";
import { stores as webStores } from "~web";
import { dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});
export const main = defineStore("main", () => {
  const {
    browse: { services: browseServices },
  } = injectLocal(edgecreatorSocketInjectionKey)!;
  const {
    edges: { services: edgesServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const publicationcode = ref<string | null>(null),
    issuecodes = ref<string[]>([]),
    isRange = ref(false),
    photoUrls = ref<Record<string, string>>({}),
    contributors = ref<ModelContributor[]>([]),
    edgesBefore = ref<(EdgeWithModelIdAndInducksData | undefined)[]>([]),
    edgesAfter = ref<(EdgeWithModelIdAndInducksData | undefined)[]>([]),
    publicationElements = ref<string[]>([]),
    publicationPhotos = ref<string[]>([]),
    warnings = ref<string[]>([]),
    country = computed(() => publicationcode.value?.split("/")[0]),
    magazine = computed(() => publicationcode.value?.split("/")[1]),
    publicationIssuecodes = computed(
      () =>
        (publicationcode.value &&
          webStores.coa().issuecodesByPublicationcode[publicationcode.value]) ||
        [],
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
      const firstIssueIndex = publicationIssuecodes.value.findIndex(
        (issuecode) => issuecode === firstIssuecode,
      );
      if (lastIssuecode === undefined) {
        issuecodes.value = [firstIssuecode, ...(otherIssuecodes || [])];
      } else {
        isRange.value = true;
        let lastIssueIndex = publicationIssuecodes.value.findIndex(
          (issuecode) => issuecode === lastIssuecode,
        );
        if (lastIssueIndex === -1) {
          lastIssueIndex = publicationIssuecodes.value.length - 1;
          console.warn(
            `Issue ${lastIssuecode} doesn't exist, falling back to ${publicationIssuecodes.value[lastIssueIndex]}`,
          );
        }

        issuecodes.value = publicationIssuecodes.value.filter(
          (_, index) => index >= firstIssueIndex && index <= lastIssueIndex,
        );
      }
    },
    loadItems = async ({ itemType }: { itemType: "elements" | "photos" }) => {
      const items = (
        await browseServices.listEdgeParts({
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
      webStores
        .coa()
        .fetchIssuecodesByPublicationcode([publicationcode.value!]),
    getEdgePublicationStates = async (issuecodes: string[]) =>
      [
        ...new Set(Object.values(await edgesServices.getEdges({ issuecodes }))),
      ].sort((a, b) =>
        Math.sign(
          issuecodes.indexOf(a!.issuecode) - issuecodes.indexOf(b!.issuecode),
        ),
      ),
    loadSurroundingEdges = async () => {
      const firstIssueIndex = publicationIssuecodes.value.findIndex(
        (issue) => issue === issuecodes.value[0],
      );
      const lastIssueIndex = publicationIssuecodes.value.findIndex(
        (issue) => issue === issuecodes.value[issuecodes.value.length - 1],
      );
      const issuesBefore = publicationIssuecodes.value.filter(
        (_, index) =>
          firstIssueIndex !== -1 &&
          index >= firstIssueIndex - 10 &&
          index < firstIssueIndex,
      );
      const issuesAfter = publicationIssuecodes.value.filter(
        (_, index) =>
          lastIssueIndex !== -1 &&
          index > lastIssueIndex &&
          index <= lastIssueIndex + 10,
      );

      if (issuesBefore.length) {
        edgesBefore.value = await getEdgePublicationStates(issuesBefore);
      }

      if (issuesAfter.length) {
        edgesAfter.value = await getEdgePublicationStates(issuesAfter);
      }
    },
    getChunkedRequests = async ({
      api,
      url,
      parametersToChunk,
      chunkSize,
      suffix = "",
    }: {
      api: AxiosInstance;
      url: string;
      parametersToChunk: (string | number)[];
      chunkSize: number;
      suffix?: string;
    }) =>
      await Promise.all(
        await Array.from(
          { length: Math.ceil(parametersToChunk.length / chunkSize) },
          (_, i) =>
            parametersToChunk.slice(i * chunkSize, i * chunkSize + chunkSize),
        ).reduce(
          async (acc, codeChunk) =>
            (await acc).concat(
              await api.get(`${url}${codeChunk.join(",")}${suffix}`),
            ),
          Promise.resolve([]),
        ),
      );
  return {
    publicationcode,
    issuecodes,
    isRange,
    photoUrls,
    contributors,
    edgesBefore,
    edgesAfter,
    publicationElements,
    publicationPhotos,
    warnings,
    publicationIssuecodes,
    publicationElementsForGallery,
    publicationPhotosForGallery,
    addContributor,
    removeContributor,
    addWarning,
    removeWarning,
    setIssuecodes,
    loadItems,
    loadPublicationIssues,
    loadSurroundingEdges,
    getChunkedRequests,
  };
});
