import axios from "axios";

const URL_PREFIX_COUNTRIES = `/api/coa/list/countries/${window.locale}`
const URL_PREFIX_PUBLICATIONS = '/api/coa/list/publications/'
const URL_PREFIX_ISSUES = '/api/coa/list/issues/'

export default {
    namespaced: true,
    state: () => ({
        countryNames: null,
        publicationNames: null,
        issueNumbers: null,
        isLoadingCountryNames: false
    }),

    mutations: {
        setCountryNames(state, countryNames) {
            state.countryNames = countryNames
        },
        setPublicationNames(state, publicationNames) {
            state.publicationNames = Object.keys(publicationNames)
                .sort()
                .reduce((acc, publicationCode) => ({
                    ...acc,
                    [publicationCode]: publicationNames[publicationCode]
                }), {})
        },
        setIssueNumbers(state, issueNumbers) {
            state.issueNumbers = issueNumbers
        },
    },

    actions: {
        fetchCountryNames: async ({ state, commit }) => {
            if (!state.isLoadingCountryNames && !state.countryNames) {
                state.isLoadingCountryNames = true
                commit("setCountryNames", (await axios.get(URL_PREFIX_COUNTRIES)).data)
                state.isLoadingCountryNames = false
            }
        },
        fetchPublicationNames: async ({ state, commit, dispatch }, publicationCodes) => {
            const newPublicationCodes = [...new Set(publicationCodes.filter(publicationCode =>
                !Object.keys(state.publicationNames || {}).includes(publicationCode)
            ))]
            return newPublicationCodes.length
                && commit("setPublicationNames", {
                    ...(state.publicationNames || {}),
                    ...await dispatch('getChunkedRequests', {
                        url: URL_PREFIX_PUBLICATIONS,
                        parametersToChunk: newPublicationCodes,
                        chunkSize: 10
                    }).then(data => data.reduce((acc, result) => ({...acc, ...result.data}), {}))
                });
        },

        fetchIssueNumbers: async ({ state, commit, dispatch }, publicationCodes) => {
            const newPublicationCodes = [...new Set(publicationCodes.filter(publicationCode =>
                !Object.keys(state.issueNumbers || {}).includes(publicationCode)
            ))]
            return newPublicationCodes.length && commit("setIssueNumbers", {
                ...(state.issueNumbers || {}),
                ...await dispatch('getChunkedRequests', {
                    url: URL_PREFIX_ISSUES,
                    parametersToChunk: newPublicationCodes,
                    chunkSize: 1
                }).then(data => data.reduce((acc, result) => ({
                    ...acc,
                    [result.config.url.replace(URL_PREFIX_ISSUES, '')]: result.data.map(issueNumber => issueNumber.replace(/ /g, ''))
                }), {}))
            });
        },

        getChunkedRequests: async (_, {url, parametersToChunk, chunkSize}) =>
            await Promise.all(
                await Array.from({length: Math.ceil(parametersToChunk.length / chunkSize)}, (v, i) =>
                    parametersToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
                ).reduce(async (acc, codeChunk) =>
                        (await acc).concat(await axios.get(`${url}${codeChunk.join(',')}`)),
                    Promise.resolve([])
                )
            )
    }
}