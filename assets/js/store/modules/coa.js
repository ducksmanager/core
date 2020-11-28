import Vue from 'vue'
import axios from "axios";
import {coaCache} from "../../util/cache"

const coaApi = axios.create({
  adapter: coaCache.adapter,
})

const URL_PREFIX_COUNTRIES = `/api/coa/list/countries/${window.locale}`
const URL_PREFIX_PUBLICATIONS = '/api/coa/list/publications/'
const URL_PREFIX_ISSUES = '/api/coa/list/issues/'
const URL_PREFIX_AUTHORS = '/api/coa/authorsfullnames/'
const URL_PREFIX_URLS = '/api/coa/list/details/'
const URL_ISSUE_COUNTS = '/api/coa/list/issues/count'

export default {
  namespaced: true,
  state: () => ({
    countryNames: null,
    publicationNames: null,
    publicationNamesFullCountries: [],
    personNames: null,
    issueNumbers: null,
    issueDetails: {},
    isLoadingCountryNames: false,
    issueCounts: null,
  }),

  mutations: {
    setCountryNames(state, countryNames) {
      state.countryNames = countryNames
    },
    setPublicationNames(state, publicationNames) {
      state.publicationNames = {
        ...(state.publicationNames || {}),
        ...Object.keys(publicationNames)
          .reduce((acc, publicationCode) => ({
            ...acc,
            [publicationCode]: publicationNames[publicationCode]
          }), {})
      }
    },
    setPublicationNamesFullCountries(state, publicationNamesFullCountries) {
      state.publicationNamesFullCountries = publicationNamesFullCountries
    },
    setPersonNames(state, personNames) {
      state.personNames = Object.keys(personNames)
        .reduce((acc, personCode) => ({
          ...acc,
          [personCode]: personNames[personCode]
        }), {})
    },
    setIssueNumbers(state, issueNumbers) {
      state.issueNumbers = issueNumbers
    },
    addIssueNumbers(state, issueNumbers) {
      state.issueNumbers = {...state.issueNumbers, ...issueNumbers}
    },
    setIssueDetails(state, {issueCode, issueDetails}) {
      Vue.set(state.issueDetails, issueCode, issueDetails)
    },
    setIssueCounts(state, issueCounts) {
      state.issueCounts = issueCounts
    },
  },

  actions: {
    fetchCountryNames: async ({state, commit}) => {
      if (!state.isLoadingCountryNames && !state.countryNames) {
        state.isLoadingCountryNames = true
        commit("setCountryNames", (await coaApi.get(URL_PREFIX_COUNTRIES)).data)
        state.isLoadingCountryNames = false
      }
    },
    fetchPublicationNames: async ({state, commit, dispatch}, publicationCodes) => {
      const newPublicationCodes = [...new Set(publicationCodes.filter(publicationCode =>
        !Object.keys(state.publicationNames || {}).includes(publicationCode)
      ))]
      return newPublicationCodes.length
        && commit("setPublicationNames",
          await dispatch('getChunkedRequests', {
            url: URL_PREFIX_PUBLICATIONS,
            parametersToChunk: newPublicationCodes,
            chunkSize: 10
          }).then(data => data.reduce((acc, result) => ({...acc, ...result.data}), {}))
        );
    },
    fetchPublicationNamesFromCountry: async ({state, commit, dispatch}, countryCode) => {
      if (state.publicationNamesFullCountries.includes(countryCode)) {
        return
      }
      return coaApi.get(URL_PREFIX_PUBLICATIONS + countryCode).then(({data}) => {
        commit("setPublicationNames", {
          ...(state.publicationNames || {}),
          ...data
        })
        commit("setPublicationNamesFullCountries", [
          ...state.publicationNamesFullCountries,
          countryCode
        ])
      })
    },
    fetchPersonNames: async ({state, commit, dispatch}, personCodes) => {
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

    fetchIssueNumbers: async ({state, commit, dispatch}, publicationCodes) => {
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

    fetchIssueCounts: async ({state, commit}) => {
      if (!state.issueCounts) {
        const issueCounts = (await coaApi.get(URL_ISSUE_COUNTS)).data;
        commit("setIssueCounts", issueCounts)
      }
    },

    fetchIssueUrls: async ({state, commit}, {publicationCode, issueNumber}) => {
      const issueCode = `${publicationCode} ${issueNumber}`
      if (!state.issueDetails[issueCode]) {
        commit("setIssueDetails", {
          issueCode,
          issueDetails: (await coaApi.get(`${URL_PREFIX_URLS + publicationCode}/${issueNumber}`)).data
        })
      }
    },

    getChunkedRequests: async (_, {url, parametersToChunk, chunkSize}) =>
      await Promise.all(
        await Array.from({length: Math.ceil(parametersToChunk.length / chunkSize)}, (v, i) =>
          parametersToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
        ).reduce(async (acc, codeChunk) =>
            (await acc).concat(await coaApi.get(`${url}${codeChunk.join(',')}`)),
          Promise.resolve([])
        )
      )
  }
}