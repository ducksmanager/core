import axios from "axios";
import {safeLoad} from "js-yaml";

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

                const yamlL10n= (await axios.get(window.l10nUrl)).data
                commit('setL10n', safeLoad(yamlL10n))

                const l10nRoutes= (await axios.get('/routes')).data
                commit('setL10nRoutes', l10nRoutes)

                state.isLoading = false
            }
        }
    }
}