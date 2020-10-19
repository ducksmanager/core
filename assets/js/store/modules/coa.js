import axios from "axios";

const URL_PREFIX_COUNTRIES = `/api/coa/list/countries/${window.locale}`
const URL_PREFIX_PUBLICATIONS = '/api/coa/list/publications/'
const URL_PREFIX_ISSUES = '/api/coa/list/issues/'
const URL_PREFIX_AUTHORS = '/api/coa/authorsfullnames/'
const URL_ISSUE_COUNTS = '/api/coa/list/issues/count'

export default {
    namespaced: true,
    state: () => ({
        countryNames: null,
        publicationNames: null,
        issueNumbers: null,
        issueCounts: null,
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
        setPersonNames(state, personNames) {
            state.publicationNames = Object.keys(personNames)
                .sort()
                .reduce((acc, personCode) => ({
                    ...acc,
                    [personCode]: personNames[personCode]
                }), {})
        },
        setIssueNumbers(state, issueNumbers) {
            state.issueNumbers = issueNumbers
        },
        setIssueCounts(state, issueCounts) {
            state.issueCounts = issueCounts
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
        fetchPersonNames: async ({ state, commit, dispatch }, personCodes) => {
            const newPersonNames = [...new Set(personCodes.filter(personCode =>
                !Object.keys(state.personNames || {}).includes(personCode)
            ))]
            return newPersonNames.length
                && commit("setPersonNames", {
                    ...(state.personNames || {}),
                    ...await dispatch('getChunkedRequests', {
                        url: URL_PREFIX_AUTHORS,
                        parametersToChunk: newPersonNames,
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

        fetchIssueCounts: async ({ state, commit }) => {
            if (!state.issueCounts) {
                const issueCounts = (await axios.get(URL_ISSUE_COUNTS)).data;
                commit("setIssueCounts", issueCounts)
            }
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