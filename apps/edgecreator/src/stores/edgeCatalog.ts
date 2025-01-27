import { defineStore } from "pinia";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { ModelSteps } from "~dm-types/ModelSteps";
import { EdgeModelDetails } from "~edgecreator-services/browse/types";
import { stores as webStores } from "~web";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";


export type EdgeWithVersionAndStatus = EdgeModelDetails & {
  status: string | null;
  published?: string | null;
};

export const edgeCatalog = defineStore("edgeCatalog", () => {
  const {
    edgeCreator: { services: edgeCreatorServices },
  } = inject(dmSocketInjectionKey)!;

  const edgeCategories = [
    {
      status: "ongoing",
      l10n: "Ongoing edges",
      svgCheckFn: (edge: EdgeModelDetails, currentUser: string) =>
        edge.designers.includes(currentUser),
    },
    {
      status: "ongoing by another user",
      l10n: "Ongoing edges handled by other users",
      svgCheckFn: (edge: EdgeModelDetails) => edge.designers.length,
    },
    {
      status: "pending",
      l10n: "Pending edges",
      svgCheckFn: () => true,
    },
  ];

  const {
    browse: { services: browseServices },
  } = inject(edgecreatorSocketInjectionKey)!;
  const isCatalogLoaded = ref(false),
    currentEdges = ref<Record<string, EdgeWithVersionAndStatus>>({}),
    publishedEdges = ref<Record<string, EdgeModelDetails>>({}),
    publishedEdgesSteps = ref<ModelSteps>({}),
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
    getEdgeWithStatus = (edge: EdgeModelDetails): EdgeModelDetails<true> => ({
      ...edge,
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

      const {
        results: edges,
        error,
        errorDetails,
      } = await browseServices.listEdgeModels();
      if (error) {
        console.error("Error while loading edge catalog", error, errorDetails);
        return;
      }
      const edgesWithStatus = edges.map(getEdgeWithStatus).groupBy('status', '[]');

      currentEdges.value = { ...currentEdges.value, ...edgesWithStatus.ongoing };
      publishedEdges.value = {...publishedEdges.value, ...edgesWithStatus.published};

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
    addPublishedEdgesSteps,
    loadPublishedEdgesSteps,
  };
});
