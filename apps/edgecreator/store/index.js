import Vue from 'vue'

export const state = () => ({
  country: null,
  magazine: null,
  issuenumbers: [],
  isRange: false,
  photoUrls: {},
  contributors: {},

  edgesBefore: [],
  edgesAfter: [],

  publicationElements: [],
  publicationPhotos: [],

  warnings: [],
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
  setIsRange(state, isRange) {
    state.isRange = isRange
  },
  setPhotoUrl(state, { issuenumber, filename }) {
    Vue.set(state.photoUrls, issuenumber, filename)
  },
  addContributor(state, { issuenumber, contributionType, user }) {
    const contributors = state.contributors[issuenumber] || {
      designers: [],
      photographers: [],
    }
    Vue.set(state.contributors, issuenumber, {
      ...contributors,
      [contributionType]: [
        ...new Set([...contributors[contributionType], user]),
      ],
    })
  },
  removeContributor(state, { contributionType, userToRemove }) {
    Object.keys(state.contributors).forEach((issuenumber) => {
      const issueContributors = state.contributors[issuenumber]
      const index = issueContributors[contributionType].findIndex((user) => {
        return user === userToRemove
      })
      issueContributors[contributionType].splice(index, 1)
      Vue.set(state.contributors, issuenumber, issueContributors)
    })
  },
  setEdgesBefore(state, { edges: edgesBefore }) {
    state.edgesBefore = edgesBefore
  },
  setEdgesAfter(state, { edges: edgesAfter }) {
    state.edgesAfter = edgesAfter
  },
  setPublicationElements(state, { items: publicationElements }) {
    state.publicationElements = publicationElements
  },
  setPublicationPhotos(state, { items: publicationPhotos }) {
    state.publicationPhotos = publicationPhotos
  },
  addWarning(state, warning) {
    state.warnings = [...state.warnings, warning]
  },
  removeWarning(state, idx) {
    state.warnings.splice(idx, 1)
  },
}

export const getters = {
  publicationcode: (state) => `${state.country}/${state.magazine}`,

  publicationIssues: (state, getters, rootState) => {
    return rootState.coa.issueNumbers[getters.publicationcode]
  },

  publicationElementsForGallery: (state) => {
    return (
      state.publicationElements &&
      state.publicationElements.map((elementFileName) => ({
        name: elementFileName,
        url: `/edges/${state.country}/elements/${elementFileName}`,
      }))
    )
  },

  publicationPhotosForGallery: (state) => {
    return (
      state.publicationPhotos &&
      state.publicationPhotos.map((elementFileName) => ({
        name: elementFileName,
        url: `/edges/${state.country}/photos/${elementFileName}`,
      }))
    )
  },
}

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

export const actions = {
  setIssuenumbers({ getters, commit }, { min, max, others }) {
    const firstIssueIndex = getters.publicationIssues.findIndex(
      (issue) => issue === min
    )
    if (firstIssueIndex === -1) {
      throw new Error(`Issue ${min} doesn't exist`)
    }
    if (max === undefined) {
      commit('setIssuenumbers', [min, ...(others ? others.split(',') : [])])
    } else {
      commit('setIsRange', true)
      let lastIssueIndex = getters.publicationIssues.findIndex(
        (issue) => issue === max
      )
      if (lastIssueIndex === -1) {
        ;[lastIssueIndex] = Object.keys(getters.publicationIssues).slice(-1)
        console.warn(
          `Issue ${max} doesn't exist, falling back to ${getters.publicationIssues[lastIssueIndex]}`
        )
      }
      commit(
        'setIssuenumbers',
        getters.publicationIssues.filter(
          (unused, index) => index >= firstIssueIndex && index <= lastIssueIndex
        )
      )
    }
  },
  async loadItems({ getters, commit }, { itemType }) {
    commit(
      itemType === 'elements'
        ? 'setPublicationElements'
        : 'setPublicationPhotos',
      {
        items: (
          await this.$axios.$get(
            `/fs/browse/${itemType}/${getters.publicationcode}`
          )
        ).sort(numericSortCollator.compare),
      }
    )
  },
  async loadPublicationIssues({ getters, dispatch }) {
    return dispatch('coa/fetchIssueNumbers', [getters.publicationcode])
  },
  async loadSurroundingEdges({ state, getters, commit }) {
    const firstIssueIndex = getters.publicationIssues.findIndex(
      (issue) => issue === state.issuenumbers[0]
    )
    const lastIssueIndex = getters.publicationIssues.findIndex(
      (issue) => issue === state.issuenumbers[state.issuenumbers.length - 1]
    )
    const issuesBefore = getters.publicationIssues.filter(
      (unused, index) =>
        firstIssueIndex !== -1 &&
        index >= firstIssueIndex - 10 &&
        index < firstIssueIndex
    )
    const issuesAfter = getters.publicationIssues.filter(
      (unused, index) =>
        lastIssueIndex !== -1 &&
        index > lastIssueIndex &&
        index <= lastIssueIndex + 10
    )

    const getEdgePublicationStates = async (edges) =>
      this.$axios
        .$get(`/api/edges/${getters.publicationcode}/${edges.join(',')}`)
        .then((data) =>
          data.sort(
            ({ issuenumber: issuenumber1 }, { issuenumber: issuenumber2 }) =>
              Math.sign(
                edges.indexOf(issuenumber1) - edges.indexOf(issuenumber2)
              )
          )
        )

    if (issuesBefore.length) {
      commit('setEdgesBefore', {
        edges: await getEdgePublicationStates(issuesBefore),
      })
    }

    if (issuesAfter.length) {
      commit('setEdgesAfter', {
        edges: await getEdgePublicationStates(issuesAfter),
      })
    }
  },

  getChunkedRequests: async (
    _,
    { api, url, parametersToChunk, chunkSize, suffix = '' }
  ) =>
    await Promise.all(
      await Array.from(
        { length: Math.ceil(parametersToChunk.length / chunkSize) },
        (_, i) =>
          parametersToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
      ).reduce(
        async (acc, codeChunk) =>
          (
            await acc
          ).concat(await api.get(`${url}${codeChunk.join(',')}${suffix}`)),
        Promise.resolve([])
      )
    ),
}
