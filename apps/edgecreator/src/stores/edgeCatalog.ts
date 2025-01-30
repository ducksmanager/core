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
  const isCatalogLoaded = ref(false),
    edges = ref<
      SuccessfulEventOutput<BrowseClientEvents, "listEdgeModels">["results"]
    >([]),
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
        await edgeCreatorEvents.getModelsSteps(
          edgeModelIds.map((modelId) => modelId),
        ),
      );
    },
    canEditEdge = (status: (typeof edges.value)[number]["status"]) =>
      webStores.collection().hasRole("Admin") ||
      status !== "Ongoing by another user",
    loadCatalog = async () => {
      if (isCatalogLoaded.value) {
        return;
      }

      const models = await browseEvents.listEdgeModels();
      if ("error" in models) {
        console.error(
          "Error while loading edge catalog",
          models.error,
          models.errorDetails,
        );
        return;
      }

      edges.value = [...edges.value, ...models.results];

      isCatalogLoaded.value = true;
    };

  const publishedEdges = computed(() =>
    edges.value
      .filter(({ status }) => status === "Published")
      .groupBy("issuecode"),
  );

  const ongoingEdges = computed(() =>
    edges.value
      .filter(({ status }) => status !== "Published")
      .groupBy("issuecode"),
  );

  return {
    canEditEdge,
    loadCatalog,
    isCatalogLoaded,
    ongoingEdges,
    publishedEdges,
    publishedEdgesSteps,
    addPublishedEdgesSteps,
    loadPublishedEdgesSteps,
  };
});
