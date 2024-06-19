import { AxiosInstance } from "axios";
import { defineStore } from "pinia";

import { api } from "~/stores/api";
import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { GET__edges__$countrycode__$magazinecode__$issuenumbers } from "~api-routes";
import { userContributionType } from "~prisma-clients/client_dm";
import { ModelContributor } from "~types/ModelContributor";
import { GET__fs__browse__$imageType__$country__$magazine } from "~types/routes";
import { SimpleUser } from "~types/SimpleUser";

import { call } from "../../axios-helper";
import { coa } from "./coa";

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});
export const main = defineStore("main", () => {
  const country = ref(null as string | null),
    magazine = ref(null as string | null),
    issuenumbers = ref([] as string[]),
    isRange = ref(false as boolean),
    photoUrls = ref({} as Record<string, string>),
    contributors = ref([] as ModelContributor[]),
    edgesBefore = ref([] as EdgeWithModelId[]),
    edgesAfter = ref([] as EdgeWithModelId[]),
    publicationElements = ref([] as string[]),
    publicationPhotos = ref([] as string[]),
    warnings = ref([] as string[]),
    publicationcode = computed(
      () =>
        country.value && magazine.value && `${country.value}/${magazine.value}`,
    ),
    publicationIssues = computed(
      () =>
        (publicationcode.value && coa().issueNumbers[publicationcode.value]) ||
        [],
    ),
    publicationElementsForGallery = computed(
      () =>
        country.value &&
        publicationElements.value.map((elementFileName) => ({
          name: elementFileName,
          url: `${import.meta.env.VITE_EDGES_URL as string
            }/${country.value!}/elements/${elementFileName}`,
        })),
    ),
    publicationPhotosForGallery = computed(
      () =>
        country.value &&
        publicationPhotos.value.map((elementFileName) => ({
          name: elementFileName,
          url: `${import.meta.env.VITE_EDGES_URL as string
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
    setIssuenumbers = ({
      min,
      max,
      others,
    }: {
      min: string;
      max?: string;
      others?: string;
    }) => {
      const firstIssueIndex = publicationIssues.value.findIndex(
        (issue) => issue === min,
      );
      if (firstIssueIndex === -1) {
        throw new Error(`Issue ${min} doesn't exist`);
      }
      if (max === undefined) {
        issuenumbers.value = [min, ...(others ? others.split(",") : [])];
      } else {
        isRange.value = true;
        let lastIssueIndex = publicationIssues.value.findIndex(
          (issue) => issue === max,
        );
        if (lastIssueIndex === -1) {
          lastIssueIndex = publicationIssues.value.length - 1;
          console.warn(
            `Issue ${max} doesn't exist, falling back to ${publicationIssues.value[lastIssueIndex]}`,
          );
        }

        issuenumbers.value = publicationIssues.value.filter(
          (_, index) => index >= firstIssueIndex && index <= lastIssueIndex,
        );
      }
    },
    loadItems = async ({ itemType }: { itemType: "elements" | "photos" }) => {
      const items = (
        await call(
          api().edgeCreatorApi,
          new GET__fs__browse__$imageType__$country__$magazine({
            params: {
              imageType: itemType,
              country: country.value!,
              magazine: magazine.value!,
            },
          }),
        )
      ).data.sort((a, b) => numericSortCollator.compare(a, b));
      if (itemType === "elements") {
        publicationElements.value = items;
      } else {
        publicationPhotos.value = items;
      }
    },
    loadPublicationIssues = async () =>
      coa().fetchIssueNumbers([publicationcode.value!]),
    getEdgePublicationStates = async (edges: string[]) =>
      [
        ...new Set(
          Object.values(
            (
              await call(
                api().dmApi,
                new GET__edges__$countrycode__$magazinecode__$issuenumbers({
                  params: {
                    countrycode: publicationcode.value!.split("/")[0],
                    magazinecode: publicationcode.value!.split("/")[1],
                    issuenumbers: edges.join(","),
                  },
                }),
              )
            ).data,
          ),
        ),
      ].sort((a, b) =>
        Math.sign(edges.indexOf(a.issuenumber) - edges.indexOf(b.issuenumber)),
      ),
    loadSurroundingEdges = async () => {
      const firstIssueIndex = publicationIssues.value.findIndex(
        (issue) => issue === issuenumbers.value[0],
      );
      const lastIssueIndex = publicationIssues.value.findIndex(
        (issue) => issue === issuenumbers.value[issuenumbers.value.length - 1],
      );
      const issuesBefore = publicationIssues.value.filter(
        (_, index) =>
          firstIssueIndex !== -1 &&
          index >= firstIssueIndex - 10 &&
          index < firstIssueIndex,
      );
      const issuesAfter = publicationIssues.value.filter(
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
    publicationIssues,
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
