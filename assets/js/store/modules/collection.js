import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    username: window.username,
    collection: null,
    purchases: null,
    watchedAuthors: null,
    suggestions: null,
    bookcase: null,
    bookcaseOrder: null,

    isLoadingCollection: false,
    isLoadingPurchases: false,
    isLoadingWatchedAuthors: false,
    isLoadingSuggestions: false,
  }),

  mutations: {
    setCollection(state, collection) {
      state.collection = collection.map(issue => ({
        ...issue,
        publicationCode: `${issue.country}/${issue.magazine}`
      }))
    },
    setPurchases(state, purchases) {
      state.purchases = purchases.sort(({date: purchaseDate1}, {date: purchaseDate2}) =>
        Math.sign(purchaseDate2 - purchaseDate1))
    },
    setWatchedAuthors(state, watchedAuthors) {
      state.watchedAuthors = watchedAuthors
    },
    setSuggestions(state, suggestions) {
      state.suggestions = suggestions
    },
    setBookcase(state, bookcase) {
      state.bookcase = bookcase
    },
    setBookcaseOrder(state, bookcaseOrder) {
      state.bookcaseOrder = bookcaseOrder
    }
  },

  getters: {
    total: state => state.collection && state.collection.length,

    totalPerCountry: state => state.collection && state.collection.reduce((acc, issue) => ({
      ...acc,
      [issue.country]: (acc[issue.country] || 0) + 1
    }), {}),

    totalPerPublication: state => state.collection && state.collection.reduce((acc, issue) => {
      const publicationCode = `${issue.country}/${issue.magazine}`
      return {...acc, [publicationCode]: (acc[publicationCode] || 0) + 1};
    }, {}),

    hasSuggestions: state => state.suggestions && state.suggestions.issues && Object.key(state.suggestions.issues).length
  },

  actions: {
    loadCollection: async ({state, commit}, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingCollection && !state.collection) {
        state.isLoadingCollection = true
        commit("setCollection", (await axios.get("/api/collection/issues")).data)
        state.isLoadingCollection = false
      }
    },
    loadPurchases: async ({state, commit}, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingPurchases && !state.purchases) {
        state.isLoadingPurchases = true
        commit("setPurchases", (await axios.get("/api/collection/purchases")).data)
        state.isLoadingPurchases = false
      }
    },
    loadWatchedAuthors: async ({state, commit}, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingWatchedAuthors && !state.watchedAuthors) {
        state.isLoadingWatchedAuthors = true
        commit("setWatchedAuthors", (await axios.get("/api/collection/authors/watched")).data)
        state.isLoadingWatchedAuthors = false
      }
    },
    loadSuggestions: async ({state, commit}, {countryCode, sinceLastVisit}) => {
      if (!state.isLoadingSuggestions && !state.suggestions) {
        state.isLoadingSuggestions = true
        commit("setSuggestions", (await axios.get(`/api/collection/stats/suggestedissues/${[
          countryCode || 'ALL',
          sinceLastVisit ? 'since_previous_visit' : '_',
          sinceLastVisit ? 100 : 20
        ].join('/')}`)).data)
        state.isLoadingSuggestions = false
      }
    },
    loadBookcase: async ({state, commit}) => {
      if (!state.bookcase) {
        commit("setBookcase", (await axios.get("/api/collection/bookcase")).data)
      }
    },
    loadBookcaseOrder: async ({state, commit}) => {
      if (!state.bookcaseOrder) {
        commit("setBookcaseOrder", (await axios.get("/api/collection/bookcase/sort")).data)
      }
    },
  }
}