import Vue from 'vue'

const URL_PREFIX_STEPS = '/api/edgecreator/v2/model/'

export const state = () => ({
  currentEdges: {},
  publishedEdges: {},
  publishedEdgesSteps: {},
})

export const mutations = {
  addCurrentEdges(state, edges) {
    state.currentEdges = { ...state.currentEdges, ...edges }
  },
  addPublishedEdges(state, publishedEdges) {
    Object.keys(publishedEdges).forEach((publicationcode) => {
      const publicationEdges = publishedEdges[publicationcode]
      if (!state.publishedEdges[publicationcode]) {
        Vue.set(state.publishedEdges, publicationcode, {})
      }
      Object.keys(publicationEdges).forEach((issueNumber) => {
        const edgeStatus = publicationEdges[issueNumber]
        if (!state.publishedEdges[publicationcode][issueNumber]) {
          Vue.set(
            state.publishedEdges[publicationcode],
            issueNumber,
            edgeStatus
          )
        } else {
          Vue.set(state.publishedEdges[publicationcode], issueNumber, {
            ...state.publishedEdges[publicationcode][issueNumber],
          })
        }
      })
    })
  },
  addPublishedEdgesSteps(state, { publicationcode, publishedEdgesSteps }) {
    if (!state.publishedEdgesSteps[publicationcode]) {
      state.publishedEdgesSteps[publicationcode] = {}
    }
    state.publishedEdgesSteps[publicationcode] = {
      ...state.publishedEdgesSteps[publicationcode],
      ...publishedEdgesSteps,
    }
  },
}

export const actions = {
  async getPublishedEdgesSteps(
    { state, commit, dispatch, rootState },
    { publicationcode, edgeModelIds }
  ) {
    const newModelIds = [
      ...new Set(
        edgeModelIds.filter(
          (modelId) => !Object.keys(state.publishedEdgesSteps).includes(modelId)
        )
      ),
    ]
    return (
      newModelIds.length &&
      commit('addPublishedEdgesSteps', {
        publicationcode,
        publishedEdgesSteps: await dispatch(
          'getChunkedRequests',
          {
            api: this.$axios,
            url: URL_PREFIX_STEPS,
            parametersToChunk: newModelIds,
            chunkSize: 10,
            suffix: '/steps',
          },
          { root: true }
        ).then((data) =>
          data.reduce((acc, result) => ({ ...acc, ...result.data }), {})
        ),
      })
    )
  },
}
