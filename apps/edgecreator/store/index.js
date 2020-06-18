export const state = () => ({
  country: null,
  magazine: null,
  issuenumber: null,

  steps: [],
  galleryItems: [],
  zoom: 1.5,
  width: 15,
  height: 200,
  edgesBefore: [],
  edgesAfter: []
})

export const mutations = {
  setCountry(state, country) {
    state.country = country
  },
  setMagazine(state, magazine) {
    state.magazine = magazine
  },
  setIssuenumber(state, issuenumber) {
    state.issuenumber = issuenumber
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
    state.width = parseFloat(width)
    state.height = parseFloat(height)
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
        `/fs/browseElements/${state.country}/${state.magazine}`
      )
    })
  },
  async loadSurroundingEdges({ state, commit }) {
    const publicationIssues = await this.$axios.$get(
      `/api/coa/list/issues/${state.country}/${state.magazine}`
    )
    const currentIssueIndex = publicationIssues.findIndex(
      (issue) => issue === state.issuenumber
    )
    const issuesBefore = publicationIssues.filter(
      (unused, index) =>
        currentIssueIndex !== -1 &&
        index >= currentIssueIndex - 10 &&
        index < currentIssueIndex
    )
    const issuesAfter = publicationIssues.filter(
      (unused, index) =>
        currentIssueIndex !== -1 &&
        index > currentIssueIndex &&
        index <= currentIssueIndex + 10
    )

    if (issuesBefore.length) {
      commit('setEdgesBefore', {
        edges: await this.$axios.$get(
          `/api/edges/${state.country}/${state.magazine}/${issuesBefore.join(
            ','
          )}`
        )
      })
    }

    if (issuesAfter.length) {
      commit('setEdgesAfter', {
        edges: await this.$axios.$get(
          `/api/edges/${state.country}/${state.magazine}/${issuesAfter.join(
            ','
          )}`
        )
      })
    }
  }
}
