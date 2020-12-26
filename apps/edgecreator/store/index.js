import Vue from 'vue'

export const state = () => ({
  country: null,
  magazine: null,
  issuenumbers: [],
  photoUrls: {},
  contributors: {},

  width: 15,
  height: 200,

  edgesBefore: [],
  edgesAfter: [],

  publicationElements: [],
  publicationPhotos: [],

  stepColors: {},

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
      [contributionType]: [...new Set([...contributors[contributionType], user])],
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
  setPublicationElements(state, { items: publicationElements }) {
    state.publicationElements = publicationElements
  },
  setPublicationPhotos(state, { items: publicationPhotos }) {
    state.publicationPhotos = publicationPhotos
  },
  setStepColors(state, { stepNumber, colors }) {
    Vue.set(state.stepColors, stepNumber, colors)
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

  colors: (state) => {
    return Object.values(state.stepColors).reduce((acc, colors) => {
      return [...new Set(acc.concat(colors))].sort()
    }, [])
  },
  publicationIssues: (state, getters, rootState) => {
    return rootState.coa.issueNumbers[getters.publicationcode]
  },
}

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

export const actions = {
  setIssuenumbersFromMinMax({ getters, commit }, { min, max }) {
    const firstIssueIndex = getters.publicationIssues.findIndex((issue) => issue === min)
    if (firstIssueIndex === -1) {
      throw new Error(`Issue ${min} doesn't exist`)
    }
    if (max === undefined) {
      commit('setIssuenumbers', [min])
    } else {
      let lastIssueIndex = getters.publicationIssues.findIndex((issue) => issue === max)
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
    commit(itemType === 'elements' ? 'setPublicationElements' : 'setPublicationPhotos', {
      items: (await this.$axios.$get(`/fs/browse/${itemType}/${getters.publicationcode}`)).sort(
        numericSortCollator.compare
      ),
    })
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
        firstIssueIndex !== -1 && index >= firstIssueIndex - 10 && index < firstIssueIndex
    )
    const issuesAfter = getters.publicationIssues.filter(
      (unused, index) =>
        lastIssueIndex !== -1 && index > lastIssueIndex && index <= lastIssueIndex + 10
    )

    if (issuesBefore.length) {
      commit('setEdgesBefore', {
        edges: await this.$axios.$get(
          `/api/edges/${getters.publicationcode}/${issuesBefore.join(',')}`
        ),
      })
    }

    if (issuesAfter.length) {
      commit('setEdgesAfter', {
        edges: await this.$axios.$get(
          `/api/edges/${getters.publicationcode}/${issuesAfter.join(',')}`
        ),
      })
    }
  },
}
