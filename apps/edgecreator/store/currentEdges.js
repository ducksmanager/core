export const state = () => ({
  edges: null,
})

export const mutations = {
  setEdges(state, edges) {
    state.edges = edges
  },
}
