export const state = () => ({
  currentEdges: {},
  publishedEdges: {},
})

export const mutations = {
  addCurrentEdges(state, edges) {
    state.currentEdges = { ...state.currentEdges, ...edges }
  },
  addPublishedEdges(state, publishedEdges) {
    const combinedPublicationCodes = [
      ...new Set([...Object.keys(publishedEdges), ...Object.keys(state.publishedEdges)]),
    ]
    state.publishedEdges = combinedPublicationCodes.reduce(
      (acc, publicationcode) => ({
        ...acc,
        [publicationcode]: [
          ...new Set([
            ...(publishedEdges[publicationcode] || []),
            ...(state.publishedEdges[publicationcode] || []),
          ]),
        ],
      }),
      {}
    )
  },
}
