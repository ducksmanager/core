import Vue from 'vue'
import { defineStore } from 'pinia'
import { main } from '~/stores/main'

const URL_PREFIX_STEPS = '/api/edgecreator/v2/model/'

export const edgeCatalog = defineStore('edgeCatalog', {
  state: () => ({
    currentEdges: {},
    publishedEdges: {},
    publishedEdgesSteps: {},
  }),

  actions: {
    addCurrentEdges(edges) {
      this.currentEdges = { ...this.currentEdges, ...edges }
    },
    addPublishedEdges(publishedEdges) {
      Object.keys(publishedEdges).forEach((publicationcode) => {
        const publicationEdges = publishedEdges[publicationcode]
        if (!this.publishedEdges[publicationcode]) {
          Vue.set(this.publishedEdges, publicationcode, {})
        }
        Object.keys(publicationEdges).forEach((issueNumber) => {
          const edgeStatus = publicationEdges[issueNumber]
          if (!this.publishedEdges[publicationcode][issueNumber]) {
            Vue.set(
              this.publishedEdges[publicationcode],
              issueNumber,
              edgeStatus
            )
          } else {
            Vue.set(this.publishedEdges[publicationcode], issueNumber, {
              ...this.publishedEdges[publicationcode][issueNumber],
            })
          }
        })
      })
    },
    addPublishedEdgesSteps({ publicationcode, publishedEdgesSteps }) {
      if (!this.publishedEdgesSteps[publicationcode]) {
        this.publishedEdgesSteps[publicationcode] = {}
      }
      this.publishedEdgesSteps[publicationcode] = {
        ...this.publishedEdgesSteps[publicationcode],
        ...publishedEdgesSteps,
      }
    },
    async getPublishedEdgesSteps({ publicationcode, edgeModelIds }) {
      const newModelIds = [
        ...new Set(
          edgeModelIds.filter(
            (modelId) =>
              !Object.keys(this.publishedEdgesSteps).includes(modelId)
          )
        ),
      ]
      return (
        newModelIds.length &&
        this.addPublishedEdgesSteps({
          publicationcode,
          publishedEdgesSteps: await main
            .getChunkedRequests(
              {
                api: this.$nuxt.$axios,
                url: URL_PREFIX_STEPS,
                parametersToChunk: newModelIds,
                chunkSize: 10,
                suffix: '/steps',
              },
              { root: true }
            )
            .then((data) =>
              data.reduce((acc, result) => ({ ...acc, ...result.data }), {})
            ),
        })
      )
    },
  },
})
