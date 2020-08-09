import Vue from 'vue'

export const state = () => ({
  currentEdges: null,
  publishedEdges: {},
})

export const mutations = {
  setCurrentEdges(state, currentEdges) {
    state.currentEdges = currentEdges
  },
  setPublishedEdges(state, { publicationCode, publishedEdges }) {
    Vue.set(state.publishedEdges, publicationCode, publishedEdges)
  },
}
