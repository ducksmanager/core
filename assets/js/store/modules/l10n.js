import axios from "axios";

import {appCache} from "../../util/cache"

const appApi = axios.create({
  adapter: appCache.adapter,
})

export default {
  namespaced: true,
  state: () => ({
    isLoading: false,
    l10nRoutes: null
  }),

  mutations: {
    setL10nRoutes(state, l10nRoutes) {
      state.l10nRoutes = l10nRoutes
    }
  },

  actions: {
    loadL10n: async ({state, commit}) => {
      if (!state.isLoading && !state.l10nRoutes) {
        state.isLoading = true

        const l10nRoutes = (await appApi.get(`/routes?${localStorage.getItem('commit')}`)).data
        commit('setL10nRoutes', l10nRoutes)

        state.isLoading = false
      }
    }
  }
}
