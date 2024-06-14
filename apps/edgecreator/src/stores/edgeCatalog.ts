import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { ModelSteps } from "~dm-types/ModelSteps";
import { stores as webStores } from "~web";
import { dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

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

export const edgeCatalog = defineStore("edgeCatalog", () => {
  const {
    edgeCreator: { services: edgeCreatorServices },
    edges: { services: edgesServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const edgeCategories = [
    {
      status: "ongoing",
      l10n: "Ongoing edges",
      svgCheckFn: (edge: Edge, currentUser: string) =>
        edge.designers.includes(currentUser),
    },
    {
      status: "ongoing by another user",
      l10n: "Ongoing edges handled by other users",
      svgCheckFn: (edge: Edge) => edge.designers.length,
    },
    {
      status: "pending",
      l10n: "Pending edges",
      svgCheckFn: () => true,
    },
  ];

  const {
    browse: { services: browseServices },
  } = injectLocal(edgecreatorSocketInjectionKey)!;
  const isCatalogLoaded = ref<boolean>(false),
    currentEdges = ref<Record<string, EdgeWithVersionAndStatus>>({}),
    publishedEdges = ref(
      {} as Record<
        string,
        Record<string, { issuenumber: string; v3: boolean }>
      >,
    ),
    publishedEdgesSteps = ref<Record<string, ModelSteps>>({}),
    edgesByStatus = computed(() => {
      const currentEdgesByStatus: Record<
        string,
        Record<string, EdgeWithVersionAndStatus[]>
      > = Object.values(edgeCategories).reduce(
        (acc, { status }) => ({
          ...acc,
          [status]: {},
        }),
        {},
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
        currentEdgesByStatus,
      );
    }),
    fetchPublishedEdges = async (publicationcode: string) => {
      const [countrycode, magazinecode] = publicationcode.split("/");
      addPublishedEdges({
        [publicationcode]: await edgesServices.getEdges(
          `${countrycode}/${magazinecode}`,
          undefined,
        ),
      });
    },
    addCurrentEdges = (edges: Record<string, EdgeWithVersionAndStatus>) => {
      currentEdges.value = { ...currentEdges.value, ...edges };
    },
    addPublishedEdges = (
      newPublishedEdges: Record<
        string,
        Record<string, { issuenumber: string; v3: boolean }>
      >,
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
    loadPublishedEdgesSteps = async ({
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
        newPublishedEdgesSteps: await edgeCreatorServices.getModelsSteps(
          newModelIds.map((modelId) => modelId),
        ),
      });
    },
    // getEdgeFromApi = (
    //   { country, magazine, issuenumber, contributors, photos }: EdgeModel,
    //   status: string
    // ) => {
    //   const issuecode = `${country}/${magazine} ${issuenumber}`;
    //   const getContributorsOfType = (contributionType: string) =>
    //     (contributors ?? [])
    //       .filter(({ contribution }) => contribution === contributionType)
    //       .map(
    //         ({ userId }) =>
    //           users().allUsers!.find(({ id }) => id === userId)!
    //             .username as string
    //       );
    //   const photo = photos?.find(({ isMainPhoto }) => isMainPhoto);
    //   return {
    //     country,
    //     magazine,
    //     issuenumber,
    //     issuecode,
    //     v3: false,
    //     designers: getContributorsOfType("createur"),
    //     photographers: getContributorsOfType("photographe"),
    //     photo: photo?.elementImage.fileName,
    //     status,
    //   };
    // },
    getEdgeFromSvg = (edge: Edge): EdgeWithVersionAndStatus => ({
      ...edge,
      v3: true,
      status: edgeCategories.reduce(
        (acc: string | null, { status, svgCheckFn }) =>
          acc ??
          (svgCheckFn(edge, webStores.collection().user!.username)
            ? status
            : null),
        null,
      ),
    }),
    canEditEdge = (status: string) =>
      webStores.collection().hasRole("Admin") ||
      status !== "ongoing by another user",
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
    loadCatalog = async () => {
      if (isCatalogLoaded.value) {
        return;
      }

      const newCurrentEdges: typeof currentEdges.value = {};
      const publishedSvgEdges: typeof publishedEdges.value = {};

      const {
        results: edges,
        error,
        errorDetails,
      } = await browseServices.listEdgeModels();
      if (error) {
        console.error("Error while loading edge catalog", error, errorDetails);
        return;
      }
      for (const edgeStatus in edges) {
        for (const { filename, designers, photographers } of edges[
          edgeStatus as keyof typeof edges
        ]) {
          const [, country, magazine, issuenumber] = filename.match(
            /([^/]+)\/gen\/_?([^.]+)\.(.+).svg$/,
          )!;
          // if ([country, magazine, issuenumber].includes(undefined)) {
          //   console.error(`Invalid SVG file name : ${fileName}`);
          //   continue;
          // }
          const publicationcode = `${country}/${magazine}`;
          try {
            if (edgeStatus === "published") {
              if (!publishedSvgEdges[publicationcode]) {
                publishedSvgEdges[publicationcode] = {};
              }
              publishedSvgEdges[publicationcode][issuenumber] = {
                issuenumber,
                v3: true,
              };
            } else {
              const publicationcode = `${country}/${magazine}`;
              const issuecode = `${publicationcode} ${issuenumber}`;
              newCurrentEdges[issuecode] = getEdgeFromSvg({
                country,
                magazine,
                issuenumber,
                designers,
                photographers,
              });
            }
          } catch (e) {
            console.error(
              `No SVG found : ${country}/${magazine} ${issuenumber}`,
            );
          }
        }
      }

      if (Object.keys(newCurrentEdges).length) {
        await webStores
          .coa()
          .fetchPublicationNames([
            ...new Set(
              Object.values(newCurrentEdges).map(
                ({ country, magazine }) => `${country}/${magazine}`,
              ),
            ),
          ]);

        for (const edgeIssueCode of Object.keys(newCurrentEdges)) {
          newCurrentEdges[edgeIssueCode].published = getEdgeStatus(
            newCurrentEdges[edgeIssueCode],
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
    loadPublishedEdgesSteps,
  };
});
