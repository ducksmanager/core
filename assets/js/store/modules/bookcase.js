import Vue from 'vue'
import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    loadedSprites: {},

    isPrivateBookcase: false,
    isUserNotExisting: false,
    bookcaseUsername: null,
    bookcase: null,
    bookcaseOptions: null,
    bookcaseOrder: null,

    edgeIndexToLoad: 0
  }),

  mutations: {
    addLoadedSprite(state, {spritePath, css}) {
      Vue.set(state.loadedSprites, spritePath, css)
    },
    setBookcase(state, bookcase) {
      state.bookcase = bookcase
    },
    setBookcaseUsername(state, bookcaseUsername) {
      state.bookcaseUsername = bookcaseUsername
    },
    setBookcaseOptions(state, bookcaseOptions) {
      state.bookcaseOptions = bookcaseOptions
    },
    setBookcaseOrder(state, bookcaseOrder) {
      state.bookcaseOrder = bookcaseOrder
    },
    setIsPrivateBookcase(state, isPrivateBookcase) {
      state.isPrivateBookcase = isPrivateBookcase
    },
    setIsUserNotExisting(state, isUserNotExisting) {
      state.isUserNotExisting = isUserNotExisting
    },
    incrementEdgeIndexToLoad(state) {
      state.edgeIndexToLoad++
    },
  },

  getters: {
    isSharedBookcase: state => localStorage.getItem('username') !== state.bookcaseUsername,

    bookcaseWithPopularities: (state, getters, rootState) =>
      (getters.isSharedBookcase ? true : rootState.collection.popularIssuesInCollection)
      && state.bookcase
      && state.bookcase
        .map((issue) => {
          const publicationCode = `${issue.countryCode}/${issue.magazineCode}`;
          const issueCode = `${publicationCode} ${issue.issueNumber}`;
          return {
            ...issue,
            publicationCode,
            issueCode,
            popularity: getters.isSharedBookcase ? null : rootState.collection.popularIssuesInCollection[issueCode] || 0
          };
        })
  },

  actions: {
    loadBookcase: async ({state, commit}) => {
      if (!state.bookcase) {
        try {
          commit("setBookcase", (await axios.get(`/api/bookcase/${state.bookcaseUsername}`)).data)
        } catch (e) {
          switch (e.response.status) {
            case 403:
              commit("setIsPrivateBookcase", true)
              break;
            case 404:
              commit("setIsUserNotExisting", true)
              break;
          }
        }
      }
    },
    loadBookcaseOptions: async ({state, commit}) => {
      if (!state.bookcaseOptions) {
        commit("setBookcaseOptions", (await axios.get(`/api/bookcase/${state.bookcaseUsername}/options`)).data)
      }
    },
    updateBookcaseOptions: async ({state}) => {
      await axios.post(`/api/bookcase/options`, state.bookcaseOptions)
    },

    loadBookcaseOrder: async ({state, commit}) => {
      if (!state.bookcaseOrder) {
        commit("setBookcaseOrder", (await axios.get(`/api/bookcase/${state.bookcaseUsername}/sort`)).data)
      }
    },
    updateBookcaseOrder: async ({state}) => {
      await axios.post(`/api/bookcase/sort`, {sorts: state.bookcaseOrder})
    },
  }
}
