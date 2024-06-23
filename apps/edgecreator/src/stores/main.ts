import type { AxiosInstance } from "axios";
import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import type { userContributionType } from "~prisma-clients/extended/dm.extends";
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

  const country = ref<string | null>(null),
    magazine = ref<string | null>(null),
    issuenumbers = ref<string[]>([]),
    isRange = ref<boolean>(false),
    photoUrls = ref<Record<string, string>>({}),
    contributors = ref<ModelContributor[]>([]),
    edgesBefore = ref<EdgeWithModelId[]>([]),
    edgesAfter = ref<EdgeWithModelId[]>([]),
    publicationElements = ref<string[]>([]),
    publicationPhotos = ref<string[]>([]),
    warnings = ref<string[]>([]),
    publicationcode = computed(
      () =>
        country.value && magazine.value && `${country.value}/${magazine.value}`,
    ),
    publicationIssuenumbers = computed(
      () =>
        (publicationcode.value &&
          webStores.coa().issueNumbers[publicationcode.value]) ||
        [],
    ),
    publicationIssuecodes = computed(
      () =>
        (publicationcode.value &&
          webStores.coa().issuecodes[publicationcode.value]) ||
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
      issuenumber,
      contributionType,
      user,
    }: {
      issuenumber: string;
      contributionType: userContributionType;
      user: SimpleUser;
    }) => {
      removeContributor({ contributionType, userToRemove: user });
      contributors.value.push({
        issuenumber,
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
    setIssuenumbers = (
      firstIssuenumber: string,
      lastIssuenumber?: string,
      otherIssuenumbers?: string[],
    ) => {
      const firstIssueIndex = publicationIssuenumbers.value.findIndex(
        (issuenumber) => issuenumber === firstIssuenumber,
      );
      if (lastIssuenumber === undefined) {
        issuenumbers.value = [firstIssuenumber, ...(otherIssuenumbers || [])];
      } else {
        isRange.value = true;
        let lastIssueIndex = publicationIssuenumbers.value.findIndex(
          (issuenumber) => issuenumber === lastIssuenumber,
        );
        if (lastIssueIndex === -1) {
          lastIssueIndex = publicationIssuenumbers.value.length - 1;
          console.warn(
            `Issue ${lastIssuenumber} doesn't exist, falling back to ${publicationIssuenumbers.value[lastIssueIndex]}`,
          );
        }

        issuenumbers.value = publicationIssuenumbers.value.filter(
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
      webStores.coa().fetchIssueNumbers([publicationcode.value!]),
    getEdgePublicationStates = async (edges: string[]) =>
      [
        ...new Set(
          Object.values(
            await edgesServices.getEdges(publicationcode.value!, edges),
          ),
        ),
      ].sort((a, b) =>
        Math.sign(edges.indexOf(a.issuenumber) - edges.indexOf(b.issuenumber)),
      ),
    loadSurroundingEdges = async () => {
      const firstIssueIndex = publicationIssuenumbers.value.findIndex(
        (issue) => issue === issuenumbers.value[0],
      );
      const lastIssueIndex = publicationIssuenumbers.value.findIndex(
        (issue) => issue === issuenumbers.value[issuenumbers.value.length - 1],
      );
      const issuesBefore = publicationIssuenumbers.value.filter(
        (_, index) =>
          firstIssueIndex !== -1 &&
          index >= firstIssueIndex - 10 &&
          index < firstIssueIndex,
      );
      const issuesAfter = publicationIssuenumbers.value.filter(
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
    country,
    magazine,
    issuenumbers,
    isRange,
    photoUrls,
    contributors,
    edgesBefore,
    edgesAfter,
    publicationElements,
    publicationPhotos,
    warnings,
    publicationcode,
    publicationIssuecodes,
    publicationIssuenumbers,
    publicationElementsForGallery,
    publicationPhotosForGallery,
    addContributor,
    removeContributor,
    addWarning,
    removeWarning,
    setIssuenumbers,
    loadItems,
    loadPublicationIssues,
    loadSurroundingEdges,
    getChunkedRequests,
  };
});
