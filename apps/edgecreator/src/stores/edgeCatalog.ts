import { defineStore } from "pinia";
import type { SuccessfulEventOutput } from "socket-call-client";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import type { ModelSteps } from "~dm-types/ModelSteps";
import type { ClientEvents as BrowseClientEvents } from "~edgecreator-services/browse";
import { stores as webStores } from "~web";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

export const edgeCatalog = defineStore("edgeCatalog", () => {
  const { edgeCreator: edgeCreatorEvents } = inject(dmSocketInjectionKey)!;
  const { browse: browseEvents } = inject(edgecreatorSocketInjectionKey)!;

  const ongoingEdges = ref<
      SuccessfulEventOutput<
        BrowseClientEvents,
        "listOngoingEdgeModels"
      >["results"]
    >({}),
    publishedEdges = ref<
      Record<
        string,
        SuccessfulEventOutput<
          BrowseClientEvents,
          "listPublishedEdgeModels"
        >["results"]
      >
    >({}),
    publishedEdgesSteps = ref<ModelSteps>({}),
    addPublishedEdgesSteps = (newPublishedEdgesSteps: ModelSteps) => {
      publishedEdgesSteps.value = {
        ...publishedEdgesSteps.value,
        ...newPublishedEdgesSteps,
      };
    },
    loadPublishedEdgesSteps = async (edgeModelIds: number[]) => {
      if (!edgeModelIds.length) {
        return;
      }

      addPublishedEdgesSteps(
        await edgeCreatorEvents.getModelsSteps(
          edgeModelIds.map((modelId) => modelId),
        ),
      );
    },
    canEditEdge = (status: (typeof ongoingEdges.value)[number]["status"]) =>
      webStores.collection().hasRole("Admin") ||
      status !== "Ongoing by another user",
    fetchOngoingEdges = async () => {
      if (Object.keys(ongoingEdges.value).length) {
        return;
      }

      const models = await browseEvents.listOngoingEdgeModels().catch((e) => {
        console.error(
          "Error while loading ongoing edges",
          e.error,
          e.errorDetails,
        );
      });
      if (!models) {
        return;
      }

      ongoingEdges.value = models.results;
    },
    fetchPublishedEdges = async (publicationcode: string) => {
      if (publicationcode in publishedEdges.value) {
        return;
      }

      const models = await browseEvents
        .listPublishedEdgeModels(publicationcode)
        .catch((e) => {
          console.error(
            "Error while loading published edges",
            e.error,
            e.errorDetails,
          );
        });
      if (!models) {
        return;
      }

      publishedEdges.value = {
        ...publishedEdges.value,
        [publicationcode]: models.results,
      };
    };

  return {
    addPublishedEdgesSteps,
    canEditEdge,
    fetchOngoingEdges,
    fetchPublishedEdges,
    loadPublishedEdgesSteps,
    ongoingEdges,
    publishedEdges,
    publishedEdgesSteps,
  };
});
