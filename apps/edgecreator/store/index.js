export const state = () => ({
  edge: null,
  steps: [],
  galleryItems: [],
  zoom: 1.5,
  width: 15,
  height: 200,
  edgesBefore: [],
  edgesAfter: []
})

export const mutations = {
  setEdge(state, edge) {
    state.edge = { ...edge, country: edge.pays }
  },
  setSteps(state, steps) {
    state.steps = steps
  },
  addStep(state, step) {
    state.steps.push(step)
  },
  setZoom(state, zoom) {
    state.zoom = zoom
  },
  setDimensions(state, { width, height }) {
    state.width = parseInt(width)
    state.height = parseInt(height)
  },
  setEdgesBefore(state, { edges: edgesBefore }) {
    state.edgesBefore = edgesBefore
  },
  setEdgesAfter(state, { edges: edgesAfter }) {
    state.edgesAfter = edgesAfter
  },
  setGalleryItems(state, { items: galleryItems }) {
    state.galleryItems = galleryItems
  }
}

export const actions = {
  async loadGalleryItems({ state, commit }) {
    commit('setGalleryItems', {
      items: await this.$axios.$get(
        `/fs/browseElements/${state.edge.pays}/${state.edge.magazine}`
      )
    })
  },
  async loadSurroundingEdges({ state, commit }) {
    const publicationIssues = await this.$axios.$get(
      `/api/coa/list/issues/${state.edge.pays}/${state.edge.magazine}`
    )
    const currentIssueIndex = publicationIssues.findIndex(
      (issue) => issue === state.edge.numero
    )
    const issuesBefore = publicationIssues.filter(
      (unused, index) =>
        index >= currentIssueIndex - 10 && index < currentIssueIndex
    )
    const issuesAfter = publicationIssues.filter(
      (unused, index) =>
        index > currentIssueIndex && index <= currentIssueIndex + 10
    )

    if (issuesBefore.length) {
      commit('setEdgesBefore', {
        edges: await this.$axios.$get(
          `/api/edges/${state.edge.pays}/${
            state.edge.magazine
          }/${issuesBefore.join(',')}`
        )
      })
    }

    if (issuesAfter.length) {
      commit('setEdgesAfter', {
        edges: await this.$axios.$get(
          `/api/edges/${state.edge.pays}/${
            state.edge.magazine
          }/${issuesAfter.join(',')}`
        )
      })
    }
  }
}
