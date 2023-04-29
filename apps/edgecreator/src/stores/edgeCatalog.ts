import { EdgeModel } from "ducksmanager/types/EdgeModel";
import { defineStore } from "pinia";

import { api } from "~/stores/api";
import { ModelSteps } from "~dm_types/ModelSteps";
import {
  GET__edgecreator__model,
  GET__edgecreator__model__$modelIds__steps,
  GET__edgecreator__model__editedbyother__all,
  GET__edgecreator__model__unassigned__all,
  GET__edges__$countrycode__$magazinecode__$issuenumbers,
} from "~dm_types/routes";

import { call, getChunkedRequests } from "../../axios-helper";
import { coa } from "./coa";
import { collection } from "./collection";
import { users } from "./users";

const { getSvgMetadata, loadSvgFromString } = useSvgUtils();

interface Edge {
  country: string;
  magazine: string;
  issuenumber: string;
  designers: string[];
  photographers: string[];
}

export type EdgeWithVersionAndStatus = Edge & {
  status: string | null;
  v3: boolean;
  published?: string | null;
};

export const edgeCategories = [
  {
    status: "ongoing",
    l10n: "Ongoing edges",
    apiCall: GET__edgecreator__model,
    svgCheckFn: (edge: Edge, currentUser: string) =>
      edge.designers.includes(currentUser),
  },
  {
    status: "ongoing by another user",
    l10n: "Ongoing edges handled by other users",
    apiCall: GET__edgecreator__model__editedbyother__all,
    svgCheckFn: (edge: Edge) => edge.designers.length,
  },
  {
    status: "pending",
    l10n: "Pending edges",
    apiCall: GET__edgecreator__model__unassigned__all,
    svgCheckFn: () => true,
  },
];

export const edgeCatalog = defineStore("edgeCatalog", () => {
  const isCatalogLoaded = ref(false as boolean),
    currentEdges = ref({} as Record<string, EdgeWithVersionAndStatus>),
    publishedEdges = ref(
      {} as Record<string, Record<string, { issuenumber: string; v3: boolean }>>
    ),
    publishedEdgesSteps = ref({} as Record<string, ModelSteps>),
    edgesByStatus = computed(() => {
      const currentEdgesByStatus: Record<
        string,
        Record<string, EdgeWithVersionAndStatus[]>
      > = Object.values(edgeCategories).reduce(
        (acc, { status }) => ({
          ...acc,
          [status]: {},
        }),
        {}
      );
      return Object.values(currentEdges.value).reduce(
        (acc: typeof currentEdgesByStatus, edge) => {
          const publicationcode = `${edge.country}/${edge.magazine}`;
          if (!acc[edge.status!][publicationcode]) {
            acc[edge.status!][publicationcode] = [];
          }
          acc[edge.status!][publicationcode].push(edge);
          return acc;
        },
        currentEdgesByStatus
      );
    }),
    fetchPublishedEdges = async (publicationcode: string) => {
      const [countrycode, magazinecode] = publicationcode.split("/");
      addPublishedEdges({
        [publicationcode]: (
          await call(
            api().dmApi,
            new GET__edges__$countrycode__$magazinecode__$issuenumbers({
              params: { countrycode, magazinecode, issuenumbers: "_" },
            })
          )
        ).data,
      });
    },
    addCurrentEdges = (edges: Record<string, EdgeWithVersionAndStatus>) => {
      currentEdges.value = { ...currentEdges.value, ...edges };
    },
    addPublishedEdges = (
      newPublishedEdges: Record<
        string,
        Record<string, { issuenumber: string; v3: boolean }>
      >
    ) => {
      for (const publicationcode of Object.keys(newPublishedEdges)) {
        const publicationEdgesForPublication =
          newPublishedEdges[publicationcode];
        if (!publishedEdges.value[publicationcode]) {
          publishedEdges.value[publicationcode] = {};
        }
        for (const issueNumber of Object.keys(publicationEdgesForPublication)) {
          const edgeStatus = publicationEdgesForPublication[issueNumber];
          if (!publishedEdges.value[publicationcode][issueNumber]) {
            publishedEdges.value[publicationcode][issueNumber] = edgeStatus;
          } else {
            publishedEdges.value[publicationcode][issueNumber] = {
              ...publishedEdges.value[publicationcode][issueNumber],
            };
          }
        }
      }
    },
    addPublishedEdgesSteps = ({
      publicationcode,
      newPublishedEdgesSteps,
    }: {
      publicationcode: string;
      newPublishedEdgesSteps: ModelSteps;
    }) => {
      if (!publishedEdgesSteps.value[publicationcode]) {
        publishedEdgesSteps.value[publicationcode] = {};
      }
      publishedEdgesSteps.value[publicationcode] = {
        ...publishedEdgesSteps.value[publicationcode],
        ...newPublishedEdgesSteps,
      };
    },
    getPublishedEdgesSteps = async ({
      publicationcode,
      edgeModelIds,
    }: {
      publicationcode: string;
      edgeModelIds: number[];
    }) => {
      const newModelIds = edgeModelIds;
      if (!newModelIds.length) {
        return;
      }

      addPublishedEdgesSteps({
        publicationcode,
        newPublishedEdgesSteps:
          await getChunkedRequests<GET__edgecreator__model__$modelIds__steps>({
            callFn: (chunk) =>
              call(
                api().dmApi,
                new GET__edgecreator__model__$modelIds__steps({
                  params: { modelIds: chunk },
                })
              ),
            valuesToChunk: newModelIds.map((modelId) => String(modelId)),
            chunkSize: 10,
          }),
      });
    },
    getEdgeFromApi = (
      { country, magazine, issuenumber, contributors, photos }: EdgeModel,
      status: string
    ) => {
      const issuecode = `${country}/${magazine} ${issuenumber}`;
      const getContributorsOfType = (contributionType: string) =>
        (contributors ?? [])
          .filter(({ contribution }) => contribution === contributionType)
          .map(
            ({ userId }) =>
              users().allUsers!.find(({ id }) => id === userId)!
                .username as string
          );
      const photo = photos?.find(({ isMainPhoto }) => isMainPhoto);
      return {
        country,
        magazine,
        issuenumber,
        issuecode,
        v3: false,
        designers: getContributorsOfType("createur"),
        photographers: getContributorsOfType("photographe"),
        photo: photo?.elementImage.fileName,
        status,
      };
    },
    getEdgeFromSvg = (edge: Edge): EdgeWithVersionAndStatus => ({
      ...edge,
      v3: true,
      status: edgeCategories.reduce(
        (acc: string | null, { status, svgCheckFn }) =>
          acc ??
          (svgCheckFn(edge, collection().user!.username as string)
            ? status
            : null),
        null
      ),
    }),
    canEditEdge = (status: string) =>
      collection().hasRole("Admin") || status !== "ongoing by another user",
    getEdgeStatus = ({
      country,
      magazine,
      issuenumber,
    }: {
      country: string;
      magazine: string;
      issuenumber: string;
    }) => {
      let isPublished = false;
      const publicationcode = `${country}/${magazine}`;
      const publishedEdgesForPublication =
        publishedEdges.value[publicationcode] || {};
      if (publishedEdgesForPublication[issuenumber]) {
        isPublished = true;
      }
      const issuecode = `${publicationcode} ${issuenumber}`;

      return (
        currentEdges.value[issuecode] || {
          status: isPublished ? "Published" : "none",
        }
      ).status;
    },
    loadCatalog = async (withDetails: boolean) => {
      if (isCatalogLoaded.value) {
        return;
      }

      let newCurrentEdges: typeof currentEdges.value = {};
      const publishedSvgEdges: typeof publishedEdges.value = {};

      for (const { status, apiCall } of edgeCategories) {
        const data = (await call(api().dmApi, new apiCall())).data;
        newCurrentEdges = data.reduce((acc, edgeData) => {
          const edge = getEdgeFromApi(edgeData, status);
          return { ...acc, [edge.issuecode]: edge };
        }, newCurrentEdges);
      }

      const edges = (
        await call(api().edgeCreatorApi, new GET__fs__browseEdges())
      ).data;
      for (const edgeStatus in edges) {
        for (const { filename, mtime } of edges[
          edgeStatus as "current" | "published"
        ]) {
          const [, country, magazine, issuenumber] = filename.match(
            /([^/]+)\/gen\/_?([^.]+)\.(.+).svg$/
          )!;
          // if ([country, magazine, issuenumber].includes(undefined)) {
          //   console.error(`Invalid SVG file name : ${fileName}`);
          //   continue;
          // }
          const publicationcode = `${country}/${magazine}`;
          const issuecode = `${publicationcode} ${issuenumber}`;
          try {
            if (edgeStatus === "published") {
              if (!publishedSvgEdges[publicationcode]) {
                publishedSvgEdges[publicationcode] = {};
              }
              publishedSvgEdges[publicationcode][issuenumber] = {
                issuenumber,
                v3: true,
              };
            } else if (withDetails) {
              const { svgChildNodes } = await loadSvgFromString(
                country,
                magazine,
                issuenumber,
                mtime,
                edgeStatus === "published"
              );
              const designers = getSvgMetadata(
                svgChildNodes,
                "contributor-designer"
              );
              const photographers = getSvgMetadata(
                svgChildNodes,
                "contributor-photographer"
              );

              newCurrentEdges[issuecode] = getEdgeFromSvg({
                country,
                magazine,
                issuenumber,
                designers,
                photographers,
              });
            } else {
              newCurrentEdges[issuecode] = getEdgeFromSvg({
                country,
                magazine,
                issuenumber,
                designers: [],
                photographers: [],
              });
            }
          } catch (e) {
            console.error(
              `No SVG found : ${country}/${magazine} ${issuenumber}`
            );
          }
        }
      }

      if (Object.keys(newCurrentEdges).length) {
        await coa().fetchPublicationNames([
          ...new Set(
            Object.values(newCurrentEdges).map(
              ({ country, magazine }) => `${country}/${magazine}`
            )
          ),
        ]);

        for (const edgeIssueCode of Object.keys(newCurrentEdges)) {
          newCurrentEdges[edgeIssueCode].published = getEdgeStatus(
            newCurrentEdges[edgeIssueCode]
          );
        }

        addCurrentEdges(newCurrentEdges);
      }

      addPublishedEdges(publishedSvgEdges);

      isCatalogLoaded.value = true;
    };

  return {
    getEdgeStatus,
    edgesByStatus,
    canEditEdge,
    loadCatalog,
    isCatalogLoaded,
    edgeCategories,
    currentEdges,
    publishedEdges,
    publishedEdgesSteps,
    fetchPublishedEdges,
    addCurrentEdges,
    addPublishedEdges,
    addPublishedEdgesSteps,
    getPublishedEdgesSteps,
  };
});
