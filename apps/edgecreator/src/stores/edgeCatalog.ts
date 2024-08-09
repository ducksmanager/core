import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { ModelSteps } from "~dm-types/ModelSteps";
import { stores as webStores } from "~web";
import { dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

interface Edge {
  issuecode: string;
  url: string;
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
  const isCatalogLoaded = ref(false),
    currentEdges = ref<Record<string, EdgeWithVersionAndStatus>>({}),
    publishedEdges = ref<Record<string, { v3: boolean }>>({}),
    publishedEdgesSteps = ref<ModelSteps>({}),
    fetchPublishedEdges = async (publicationcode: string) => {
      const edges = await edgesServices.getEdges({ publicationcode });
      if (!("error" in edges)) {
        addPublishedEdges(edges);
      }
    },
    addCurrentEdges = (edges: Record<string, EdgeWithVersionAndStatus>) => {
      currentEdges.value = { ...currentEdges.value, ...edges };
    },
    addPublishedEdges = (
      newPublishedEdges: Record<string, { v3: boolean }>,
    ) => {
      publishedEdges.value = { ...publishedEdges.value, ...newPublishedEdges };
    },
    addPublishedEdgesSteps = (newPublishedEdgesSteps: ModelSteps) => {
      publishedEdgesSteps.value = {
        ...publishedEdgesSteps.value,
        ...newPublishedEdgesSteps,
      };
    },
    loadPublishedEdgesSteps = async ({
      edgeModelIds,
    }: {
      edgeModelIds: number[];
    }) => {
      if (!edgeModelIds.length) {
        return;
      }

      addPublishedEdgesSteps(
        await edgeCreatorServices.getModelsSteps(
          edgeModelIds.map((modelId) => modelId),
        ),
      );
    },
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
    getEdgeStatus = (issuecode: string) => {
      let isPublished = false;
      if (publishedEdges.value[issuecode]) {
        isPublished = true;
      }

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
        for (const { designers, photographers, issuecode, url } of edges[
          edgeStatus as keyof typeof edges
        ]) {
          try {
            if (edgeStatus === "published") {
              publishedSvgEdges[issuecode] = {
                v3: true,
              };
            } else {
              newCurrentEdges[issuecode] = getEdgeFromSvg({
                issuecode,
                designers,
                photographers,
                url,
              });
            }
          } catch (e) {
            console.error(`No SVG found : ${issuecode}`);
          }
        }
      }

      if (Object.keys(newCurrentEdges).length) {
        for (const edgeIssueCode of Object.keys(newCurrentEdges)) {
          newCurrentEdges[edgeIssueCode].published =
            getEdgeStatus(edgeIssueCode);
        }

        addCurrentEdges(newCurrentEdges);
      }

      addPublishedEdges(publishedSvgEdges);

      isCatalogLoaded.value = true;
    };

  return {
    getEdgeStatus,
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
