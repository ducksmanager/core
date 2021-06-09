import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    collection: null,
    purchases: null,
    watchedAuthors: null,
    suggestions: null,
    subscriptions: null,

    popularIssuesInCollection: null,
    lastPublishedEdgesForCurrentUser: null,

    isLoadingCollection: false,
    isLoadingPurchases: false,
    isLoadingWatchedAuthors: false,
    isLoadingSuggestions: false,
    isLoadingSubscriptions: false,

    user: null,
    previousVisit: null
  }),

  mutations: {
    setCollection(state, collection) {
      state.collection = collection.map(issue => ({
        ...issue,
        publicationCode: `${issue.country}/${issue.magazine}`
      }));
    },
    setPurchases(state, purchases) {
      state.purchases = purchases.sort(({ date: purchaseDate1 }, { date: purchaseDate2 }) =>
        Math.sign(purchaseDate2 - purchaseDate1));
    },
    setWatchedAuthors(state, watchedAuthors) {
      state.watchedAuthors = watchedAuthors;
    },
    setSubscriptions(state, subscriptions) {
      state.subscriptions = subscriptions;
    },
    setSuggestions(state, suggestions) {
      state.suggestions = suggestions;
    },
    setPopularIssuesInCollection(state, popularIssuesInCollection) {
      state.popularIssuesInCollection = popularIssuesInCollection;
    },
    setLastPublishedEdgesForCurrentUser(state, lastPublishedEdgesForCurrentUser) {
      state.lastPublishedEdgesForCurrentUser = lastPublishedEdgesForCurrentUser;
    },
    setUser(state, user) {
      state.user = user;
    },
    setPreviousVisit(state, previousVisit) {
      state.previousVisit = previousVisit;
    }
  },

  getters: {
    total: state => state.collection && state.collection.length,

    totalUniqueIssues: state => state.collection && state.collection.length && [...new Set(state.collection.map(
      ({
         publicationCode,
         issueNumber
       }) => `${publicationCode} ${issueNumber}`))].length,

    totalPerCountry: state => state.collection && state.collection.reduce((acc, issue) => ({
      ...acc,
      [issue.country]: (acc[issue.country] || 0) + 1
    }), {}),

    totalPerPublication: state => state.collection && state.collection.reduce((acc, issue) => {
      const publicationCode = `${issue.country}/${issue.magazine}`;
      return { ...acc, [publicationCode]: (acc[publicationCode] || 0) + 1 };
    }, {}),

    hasSuggestions: state => state.suggestions && state.suggestions.issues && Object.keys(state.suggestions.issues).length,

    popularIssuesInCollectionWithoutEdge: (state, getters, rootState, rootGetters) => rootGetters["bookcase/bookcaseWithPopularities"] && rootGetters["bookcase/bookcaseWithPopularities"]
      .filter(({ edgeId, popularity }) => !edgeId && popularity > 0)
      .sort(({ popularity: popularity1 }, { popularity: popularity2 }) => popularity2 - popularity1),

    quotedIssues: (state, getters, rootState) => {
      if (rootState.coa.issueQuotations === null) {
        return null;
      }
      const getEstimation = (publicationCode, issueNumber) => {
        const estimationData = rootState.coa.issueQuotations[`${publicationCode} ${issueNumber}`];
        return estimationData && (estimationData.max ? (estimationData.min + estimationData.max) / 2 : estimationData.min);
      };
      const CONDITION_TO_ESTIMATION_PCT = {
        bon: 1,
        moyen: 0.7,
        mauvais: 0.3,
        indefini: 0.7,
        "": 0.7
      };
      return state.collection
        && state.collection
          .filter(({ publicationCode, issueNumber }) => getEstimation(publicationCode, issueNumber))
          .map(({ publicationCode, issueNumber, condition }) => {
            const estimation = getEstimation(publicationCode, issueNumber);
            return ({
              publicationCode,
              issueNumber,
              condition,
              estimation,
              estimationGivenCondition: parseFloat((CONDITION_TO_ESTIMATION_PCT[condition] * estimation).toFixed(1))
            });
          });
    },

    quotationSum: (state, getters) => getters.quotedIssues && Math.round(getters.quotedIssues.reduce((acc, { estimationGivenCondition }) => acc + estimationGivenCondition, 0))
  },

  actions: {
    loadCollection: async ({ state, commit }, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingCollection && !state.collection) {
        state.isLoadingCollection = true;
        commit("setCollection", (await axios.get("/api/collection/issues")).data);
        state.isLoadingCollection = false;
      }
    },
    loadPurchases: async ({ state, commit }, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingPurchases && !state.purchases) {
        state.isLoadingPurchases = true;
        commit("setPurchases", (await axios.get("/api/collection/purchases")).data);
        state.isLoadingPurchases = false;
      }
    },
    loadWatchedAuthors: async ({ state, commit }, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingWatchedAuthors && !state.watchedAuthors) {
        state.isLoadingWatchedAuthors = true;
        commit("setWatchedAuthors", (await axios.get("/api/collection/authors/watched")).data);
        state.isLoadingWatchedAuthors = false;
      }
    },
    loadSuggestions: async ({ state, commit }, { countryCode, sort, sinceLastVisit }) => {
      if (!state.isLoadingSuggestions) {
        state.isLoadingSuggestions = true;
        commit("setSuggestions", (await axios.get(`/api/collection/stats/suggestedissues/${[
          countryCode || "ALL",
          sinceLastVisit ? "since_previous_visit" : "_",
          sort,
          sinceLastVisit ? 100 : 20
        ].join("/")}`)).data);
        state.isLoadingSuggestions = false;
      }
    },
    loadSubscriptions: async ({ state, commit }, afterUpdate = false) => {
      if (afterUpdate || !state.isLoadingSubscriptions && !state.subscriptions) {
        state.isLoadingSubscriptions = true;
        commit("setSubscriptions", (await axios.get("/api/collection/subscriptions")).data);
        state.isLoadingSubscriptions = false;
      }
    },
    loadPopularIssuesInCollection: async ({ state, commit }) => {
      if (!state.popularIssuesInCollection) {
        commit("setPopularIssuesInCollection", (await axios.get("/api/collection/popular")).data.reduce((acc, issue) => ({
          ...acc,
          [`${issue.country}/${issue.magazine} ${issue.issueNumber}`]: issue.popularity
        }), {}));
      }
    },
    loadLastPublishedEdgesForCurrentUser: async ({ state, commit }) => {
      if (!state.lastPublishedEdgesForCurrentUser) {
        commit("setLastPublishedEdgesForCurrentUser", (await axios.get("/api/collection/edges/lastPublished")).data.map(edge => ({
          ...edge,
          timestamp: Date.parse(edge.creationDate)
        })));
      }
    },

    loadUser: async ({ state, commit }, afterUpdate = false) => {
      if (afterUpdate || !state.user) {
        commit("setUser", Object.entries(
          (await axios.get(`/api/collection/user`)).data).reduce((acc, [key, value]) => {
            switch (key) {
              case "accepterpartage":
                acc.isShareEnabled = value;
                break;
              case "affichervideo":
                acc.isVideoShown = value;
                break;
              case "email":
                acc.email = value;
                break;
            }
            return acc;
          }, {})
        );
      }
    }
  }
};
