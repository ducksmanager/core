import Vue from 'vue'

export const state = () => ({
  currentEdges: [],
  publishedEdges: {},
})

export const mutations = {
  addCurrentEdges(state, edges) {
    state.currentEdges = [...new Set([...state.currentEdges, ...edges])]
  },
  setPublishedEdges(state, { publicationCode, publishedEdges }) {
    Vue.set(state.publishedEdges, publicationCode, publishedEdges)
  },
}
