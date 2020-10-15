import axios from "axios";

export default {
    namespaced: true,
    state: () => ({
        username: window.username,
        collection: null,
        isLoadingCollection: false,
    }),

    mutations: {
        setCollection(state, collection) {
            state.collection = collection
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
            return ({...acc, [publicationCode]: (acc[publicationCode] || 0) + 1});
        }, {})
    },

    actions: {
        loadCollection: async ({ state, commit, dispatch }, afterUpdate = false) => {
            if (afterUpdate || (!state.isLoadingCollection && !state.collection)) {
                state.isLoadingCollection = true
                commit("setCollection", (await axios.get("/api/collection/issues")).data)
                state.isLoadingCollection = false
                dispatch("coa/fetchCountryNames", null, { root: true })
                dispatch("coa/fetchPublicationNames",
                    state.collection.map(issue => `${issue.country}/${issue.magazine}`), { root: true }
                )
            }
        },
    }
}