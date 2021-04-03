import Vue from 'vue'

export const state = () => ({
  currentEdges: {},
  publishedEdges: {},
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
          Vue.set(state.publishedEdges[publicationcode], issueNumber, edgeStatus)
        } else if (edgeStatus.editable) {
          Vue.set(state.publishedEdges[publicationcode], issueNumber, {
            ...state.publishedEdges[publicationcode][issueNumber],
            editable: edgeStatus.editable,
          })
        }
      })
    })
  },
}
