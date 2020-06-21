export const state = () => ({
  country: null,
  magazine: null,
  issuenumbers: [],

  galleryItems: [],
  zoom: 1.5,
  width: 15,
  height: 200,
  edgesBefore: [],
  edgesAfter: [],
})

export const mutations = {
  setCountry(state, country) {
    state.country = country
  },
  setMagazine(state, magazine) {
    state.magazine = magazine
  },
  setIssuenumbers(state, issuenumbers) {
    state.issuenumbers = issuenumbers
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
  },
}

export const actions = {
  setIssuenumbersFromMinMax({ state, commit }, { min, max }) {
    if (max === undefined) {
      commit('setIssuenumbers', [min])
    } else {
      const firstIssueIndex = state.publicationIssues.findIndex((issue) => issue === min)
      const lastIssueIndex = state.publicationIssues.findIndex((issue) => issue === max)
      if (lastIssueIndex === -1) {
        commit('setIssuenumbers', [min])
      } else {
        commit(
          'setIssuenumbers',
          state.publicationIssues.filter(
            (unused, index) => index >= firstIssueIndex && index <= lastIssueIndex
          )
        )
      }
    }
  },
  async loadGalleryItems({ state, commit }) {
    const numericSortCollator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base',
    })
    const items = await this.$axios.$get(`/fs/browseElements/${state.country}/${state.magazine}`)

    commit('setGalleryItems', {
      items: items.sort(numericSortCollator.compare),
    })
  },
  async loadPublicationIssues({ state }) {
    state.publicationIssues = await this.$axios.$get(
      `/api/coa/list/issues/${state.country}/${state.magazine}`
    )
  },
  async loadSurroundingEdges({ state, commit }) {
    const firstIssueIndex = state.publicationIssues.findIndex(
      (issue) => issue === state.issuenumbers[0]
    )
    const lastIssueIndex = state.publicationIssues.findIndex(
      (issue) => issue === state.issuenumbers[state.issuenumbers.length - 1]
    )
    const issuesBefore = state.publicationIssues.filter(
      (unused, index) =>
        firstIssueIndex !== -1 && index >= firstIssueIndex - 10 && index < firstIssueIndex
    )
    const issuesAfter = state.publicationIssues.filter(
      (unused, index) =>
        lastIssueIndex !== -1 && index > lastIssueIndex && index <= lastIssueIndex + 10
    )

    if (issuesBefore.length) {
      commit('setEdgesBefore', {
        edges: await this.$axios.$get(
          `/api/edges/${state.country}/${state.magazine}/${issuesBefore.join(',')}`
        ),
      })
    }

    if (issuesAfter.length) {
      commit('setEdgesAfter', {
        edges: await this.$axios.$get(
          `/api/edges/${state.country}/${state.magazine}/${issuesAfter.join(',')}`
        ),
      })
    }
  },
}
