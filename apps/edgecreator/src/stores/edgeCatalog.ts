import { defineStore } from "pinia";

import { EdgeWithVersionAndStatus } from "~/composables/useEdgeCatalog";
import { api } from "~/stores/api";
import { ModelSteps } from "~dm_types/ModelSteps";
import {
  GET__edgecreator__model__$modelIds__steps,
  GET__edges__$countrycode__$magazinecode__$issuenumbers,
} from "~dm_types/routes";

import { call, getChunkedRequests } from "../../axios-helper";
export const edgeCatalog = defineStore("edgeCatalog", {
  state: () => ({
    currentEdges: {} as {
      [issuecode: string]: EdgeWithVersionAndStatus;
    },
    publishedEdges: {} as {
      [publicationcode: string]: {
        [issuenumber: string]: { issuenumber: string; v3: boolean };
      };
    },
    publishedEdgesSteps: {} as {
      [publicationcode: string]: ModelSteps;
    },
  }),

  actions: {
    async fetchPublishedEdges(publicationcode: string) {
      const [countrycode, magazinecode] = publicationcode.split("/");
      const publishedEdges = (
        await call(
          api().dmApi,
          new GET__edges__$countrycode__$magazinecode__$issuenumbers({
            params: { countrycode, magazinecode, issuenumbers: "_" },
          })
        )
      ).data;
      this.addPublishedEdges({
        [publicationcode]: publishedEdges,
      });
    },
    addCurrentEdges(edges: { [issuecode: string]: EdgeWithVersionAndStatus }) {
      this.currentEdges = { ...this.currentEdges, ...edges };
    },
    addPublishedEdges(publishedEdges: {
      [publicationcode: string]: {
        [issuenumber: string]: { issuenumber: string; v3: boolean };
      };
    }) {
      for (const publicationcode of Object.keys(publishedEdges)) {
        const publicationEdges = publishedEdges[publicationcode];
        if (!this.publishedEdges[publicationcode]) {
          this.publishedEdges[publicationcode] = {};
        }
        for (const issueNumber of Object.keys(publicationEdges)) {
          const edgeStatus = publicationEdges[issueNumber];
          if (!this.publishedEdges[publicationcode][issueNumber]) {
            this.publishedEdges[publicationcode][issueNumber] = edgeStatus;
          } else {
            this.publishedEdges[publicationcode][issueNumber] = {
              ...this.publishedEdges[publicationcode][issueNumber],
            };
          }
        }
      }
    },
    addPublishedEdgesSteps({
      publicationcode,
      publishedEdgesSteps,
    }: {
      publicationcode: string;
      publishedEdgesSteps: ModelSteps;
    }) {
      if (!this.publishedEdgesSteps[publicationcode]) {
        this.publishedEdgesSteps[publicationcode] = {};
      }
      this.publishedEdgesSteps[publicationcode] = {
        ...this.publishedEdgesSteps[publicationcode],
        ...publishedEdgesSteps,
      };
    },
    async getPublishedEdgesSteps({
      publicationcode,
      edgeModelIds,
    }: {
      publicationcode: string;
      edgeModelIds: number[];
    }) {
      const newModelIds = edgeModelIds;
      if (!newModelIds.length) {
        return;
      }

      this.addPublishedEdgesSteps({
        publicationcode,
        publishedEdgesSteps:
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
  },
});
