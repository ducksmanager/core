export const state = () => ({
  bookcase: null,
  popularIssuesInCollection: null,
})

export const mutations = {
  setBookcase(state, bookcase) {
    state.bookcase = bookcase
  },
  setPopularIssuesInCollection(state, popularIssuesInCollection) {
    state.popularIssuesInCollection = popularIssuesInCollection
  },
}

export const getters = {
  isSharedBookcase: () => false,

  bookcaseWithPopularities: (state, getters) =>
    (getters.isSharedBookcase ? true : state.popularIssuesInCollection) &&
    state.bookcase &&
    state.bookcase.map((issue) => {
      const publicationCode = `${issue.countryCode}/${issue.magazineCode}`
      const issueCode = `${publicationCode} ${issue.issueNumber}`
      return {
        ...issue,
        publicationCode,
        issueCode,
        popularity: getters.isSharedBookcase
          ? null
          : state.popularIssuesInCollection[issueCode] || 0,
      }
    }),

  popularIssuesInCollectionWithoutEdge: (state, getters) =>
    getters.bookcaseWithPopularities &&
    getters.bookcaseWithPopularities
      .filter(({ edgeId, popularity }) => !edgeId && popularity > 0)
      .sort(
        ({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 - popularity1
      ),
}

export const actions = {
  async loadBookcase({ commit, rootState }) {
    commit(
      'setBookcase',
      (await this.$axios.get(`/api/bookcase/${rootState.user.username}`)).data
    )
  },
  async loadPopularIssuesInCollection({ state, commit }) {
    if (!state.popularIssuesInCollection) {
      commit(
        'setPopularIssuesInCollection',
        (await this.$axios.get('/api/collection/popular')).data.reduce(
          (acc, issue) => ({
            ...acc,
            [`${issue.country}/${issue.magazine} ${issue.issueNumber}`]:
              issue.popularity,
          }),
          {}
        )
      )
    }
  },
}
