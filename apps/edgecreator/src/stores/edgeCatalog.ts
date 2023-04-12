import { defineStore } from "pinia";

import { EdgeWithVersionAndStatus } from "~/composables/useEdgeCatalog";
import { api } from "~/stores/api";
import { ModelSteps } from "~dm_types/ModelSteps";
import {
  GET__edgecreator__model__$modelIds__steps,
  GET__edges__$countrycode__$magazinecode__$issuenumbers,
} from "~dm_types/routes";

import { call, getChunkedRequests } from "../../axios-helper";
export const edgeCatalog = defineStore("edgeCatalog", () => {
  const currentEdges = ref({} as Record<string, EdgeWithVersionAndStatus>),
    publishedEdges = ref(
      {} as Record<string, Record<string, { issuenumber: string; v3: boolean }>>
    ),
    publishedEdgesSteps = ref({} as Record<string, ModelSteps>),
    fetchPublishedEdges = async (publicationcode: string) => {
      const [countrycode, magazinecode] = publicationcode.split("/");
      const publishedEdges = (
        await call(
          api().dmApi,
          new GET__edges__$countrycode__$magazinecode__$issuenumbers({
            params: { countrycode, magazinecode, issuenumbers: "_" },
          })
        )
      ).data;
      addPublishedEdges({
        [publicationcode]: publishedEdges,
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
      for (const publicationcode of Object.keys(publishedEdges)) {
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
    };

  return {
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
