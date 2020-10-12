import axios from "axios";
import {safeLoad} from "js-yaml";

export default {
    namespaced: true,
    state: () => ({
        isLoading: false,
        l10n: null,
        locale: window.locale
    }),

    mutations: {
        setL10n(state, l10n) {
            state.l10n = l10n
        }
    },

    actions: {
        loadL10n: async ({state, commit}) => {
            if (!state.isLoading) {
                state.isLoading = true
                const yamlL10n= (await axios.get(window.l10nUrl)).data
                state.isLoading = false
                return commit('setL10n', safeLoad(yamlL10n));
            }
        }
    }
}