import axios from "axios";
import {safeLoad} from "js-yaml";

import {appCache} from "../../util/cache"

const appApi = axios.create({
  adapter: appCache.adapter,
})

export default {
  namespaced: true,
  state: () => ({
    isLoading: false,
    l10n: null,
    l10nRoutes: null,
    locale: window.locale
  }),

  mutations: {
    setL10n(state, l10n) {
      state.l10n = l10n
    },
    setL10nRoutes(state, l10nRoutes) {
      state.l10nRoutes = l10nRoutes
    }
  },

  actions: {
    loadL10n: async ({state, commit}) => {
      if (!state.isLoading && !state.l10n) {
        state.isLoading = true

        const yamlL10n = (await appApi.get(`${window.l10nUrl}?${window.commit}`)).data
        commit('setL10n', safeLoad(yamlL10n))

        const l10nRoutes = (await appApi.get(`/routes?${window.commit}`)).data
        commit('setL10nRoutes', l10nRoutes)

        state.isLoading = false
      }
    }
  }
}