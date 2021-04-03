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
        state.publishedEdges[publicationcode] = {}
      }
      Object.keys(publicationEdges).forEach((issueNumber) => {
        const edgeStatus = publicationEdges[issueNumber]
        if (!state.publishedEdges[publicationcode][issueNumber]) {
          state.publishedEdges[publicationcode][issueNumber] = edgeStatus
        } else if (edgeStatus.editable) {
          state.publishedEdges[publicationcode][issueNumber].editable = edgeStatus.editable
        }
      })
    })
  },
}
