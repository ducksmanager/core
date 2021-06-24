import Vue from "vue";
import axios from "axios";
import { coaCache } from "../../util/cache";

const coaApi = axios.create({
  adapter: coaCache.adapter
});

const URL_PREFIX_COUNTRIES = `/api/coa/list/countries/LOCALE`;
const URL_PREFIX_PUBLICATIONS = "/api/coa/list/publications/";
const URL_PREFIX_ISSUES = "/api/coa/list/issues/";
const URL_PREFIX_AUTHORS = "/api/coa/authorsfullnames/";
const URL_PREFIX_URLS = "/api/coa/list/details/";
const URL_PREFIX_ISSUE_QUOTATIONS = "/api/coa/quotations/";
const URL_ISSUE_COUNTS = "/api/coa/list/issues/count";
const URL_ISSUE_DECOMPOSE = "/api/coa/issues/decompose";

function addPartInfo(issueDetails) {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce((acc, { storycode }) => ({
      ...acc,
      [storycode]: !storycode ? 0 : ((acc[storycode] || 0) + 1)
    }), {}))
    .filter(([, occurrences]) => occurrences > 1)
    .reduce((acc, [storycode]) => ({
      ...acc,
      [storycode]: 1
    }), {});
  return {
    ...issueDetails,
    entries: issueDetails.entries.map(entry => ({
      ...entry,
      part: storyPartCounter[entry.storycode] ? storyPartCounter[entry.storycode]++ : null
    }))
  }
}

export default {
  namespaced: true,
  state: () => ({
    countryNames: null,
    publicationNames: {},
    publicationNamesFullCountries: [],
    personNames: null,
    issueNumbers: {},
    issueDetails: {},
    isLoadingCountryNames: false,
    issueCounts: null,
    issueCodeDetails: null,
    issueQuotations: null,
    loadingIssueDetails: {}
  }),

  mutations: {
    setIsLoadingCountryNames(state, isLoadingCountryNames) {
      state.isLoadingCountryNames = isLoadingCountryNames;
    },
    setCountryNames(state, countryNames) {
      state.countryNames = countryNames;
    },
    addPublicationNames(state, publicationNames) {
      state.publicationNames = {
        ...state.publicationNames,
        ...publicationNames
      };
    },
    setPublicationNamesFullCountries(state, publicationNamesFullCountries) {
      state.publicationNamesFullCountries = publicationNamesFullCountries;
    },
    setPersonNames(state, personNames) {
      state.personNames = Object.keys(personNames)
        .reduce((acc, personCode) => ({
          ...acc,
          [personCode]: personNames[personCode]
        }), {});
    },
    addIssueNumbers(state, issueNumbers) {
      state.issueNumbers = { ...state.issueNumbers, ...issueNumbers };
    },
    setIssueDetails(state, { issueCode, issueDetails }) {
      Vue.set(state.issueDetails, issueCode, addPartInfo(issueDetails));
    },
    setIssueCounts(state, issueCounts) {
      state.issueCounts = issueCounts;
    },
    addIssueCodeDetails(state, issueCodeDetails) {
      state.issueCodeDetails = { ...state.issueCodeDetails, ...issueCodeDetails };
    },
    addIssueQuotations(state, issueQuotations) {
      state.issueQuotations = {...(state.issueQuotations || {}), ...issueQuotations};
    }
  },

  actions: {
    fetchCountryNames: async ({ state, commit }) => {
      if (!state.isLoadingCountryNames && !state.countryNames) {
        commit("setIsLoadingCountryNames", true);
        commit("setCountryNames", (await coaApi.get(
          URL_PREFIX_COUNTRIES.replace("LOCALE", localStorage.getItem("locale"))
        )).data);
        commit("setIsLoadingCountryNames", false);
      }
    },
    fetchPublicationNames: async ({ state, commit, dispatch }, publicationCodes) => {
      const newPublicationCodes = [...new Set(publicationCodes.filter(publicationCode =>
        !Object.keys(state.publicationNames).includes(publicationCode)
      ))];
      return newPublicationCodes.length
        && commit("addPublicationNames",
          await dispatch("getChunkedRequests", {
            url: URL_PREFIX_PUBLICATIONS,
            valuesToChunk: newPublicationCodes,
            chunkSize: 10
          }).then(data => data.reduce((acc, result) => ({ ...acc, ...result.data }), {}))
        );
    },
    fetchIssueQuotations: async ({ state, commit, dispatch }, publicationCodes) => {
      const newPublicationCodes = [...new Set(publicationCodes.filter(publicationCode =>
        !Object.keys(state.issueQuotations || {}).includes(publicationCode)
      ))];
      return newPublicationCodes.length
        && commit("addIssueQuotations",
          await dispatch("getChunkedRequests", {
            url: URL_PREFIX_ISSUE_QUOTATIONS,
            valuesToChunk: newPublicationCodes,
            chunkSize: 10
          }).then(data => data.reduce((acc, result) =>
            ({
              ...acc, ...result.data.reduce((issueAcc, issue) => ({
                ...issueAcc,
                [`${issue.publicationcode} ${issue.issuenumber}`]: {
                  min: issue.estimationmin,
                  max: issue.estimationmax
                }
              }), {})
            }), []))
        );
    },
    fetchPublicationNamesFromCountry: async ({ state, commit, dispatch }, countryCode) => {
      if (state.publicationNamesFullCountries.includes(countryCode)) {
        return;
      }
      return coaApi.get(URL_PREFIX_PUBLICATIONS + countryCode).then(({ data }) => {
        commit("addPublicationNames", {
          ...(state.publicationNames || {}),
          ...data
        });
        commit("setPublicationNamesFullCountries", [
          ...state.publicationNamesFullCountries,
          countryCode
        ]);
      });
    },
    fetchPersonNames: async ({ state, commit, dispatch }, personCodes) => {
      const newPersonNames = [...new Set(personCodes.filter(personCode =>
        !Object.keys(state.personNames || {}).includes(personCode)
      ))];
      return newPersonNames.length
        && commit("setPersonNames", {
          ...(state.personNames || {}),
          ...await dispatch("getChunkedRequests", {
            url: URL_PREFIX_AUTHORS,
            valuesToChunk: newPersonNames,
            chunkSize: 10
          }).then(data => data.reduce((acc, result) => ({ ...acc, ...result.data }), {}))
        });
    },

    fetchIssueNumbers: async ({ state, commit, dispatch }, publicationCodes) => {
      const newPublicationCodes = [...new Set(publicationCodes.filter(publicationCode =>
        !Object.keys(state.issueNumbers || {}).includes(publicationCode)
      ))];
      return newPublicationCodes.length && commit("addIssueNumbers", await dispatch("getChunkedRequests", {
          url: URL_PREFIX_ISSUES,
          valuesToChunk: newPublicationCodes,
          chunkSize: 1
        }).then(data => data.reduce((acc, result) => ({
          ...acc,
          [result.config.url.replace(URL_PREFIX_ISSUES, "")]: result.data.map(issueNumber => issueNumber.replace(/ /g, ""))
        }), {}))
      );
    },

    fetchIssueCodesDetails: async ({ state, commit, dispatch }, issueCodes) => {
      const newIssueCodes = [...new Set(issueCodes.filter(issueCode =>
        !Object.keys(state.issueCodeDetails || {}).includes(issueCode)
      ))];
      return newIssueCodes.length && commit("addIssueCodeDetails", await dispatch("getChunkedRequests", {
          url: URL_ISSUE_DECOMPOSE,
          valuesToChunk: newIssueCodes,
          chunkSize: 50,
          method: "post",
          parameterName: "issueCodes"
        }).then(data => data.reduce((acc, result) => ({
          ...acc,
          ...result.data
        }), {}))
      );
    },

    fetchIssueCounts: async ({ state, commit }) => {
      if (!state.issueCounts) {
        const issueCounts = (await coaApi.get(URL_ISSUE_COUNTS)).data;
        commit("setIssueCounts", issueCounts);
      }
    },

    fetchIssueUrls: async ({ state, commit }, { publicationCode, issueNumber }) => {
      const issueCode = `${publicationCode} ${issueNumber}`;
      if (!state.issueDetails[issueCode]) {
        let issueDetails = (await coaApi.get(`${URL_PREFIX_URLS + publicationCode}/${issueNumber}`)).data;
        commit("setIssueDetails", {
          issueCode,
          issueDetails
        });
      }
    },

    getChunkedRequests: async (_, {
      url,
      valuesToChunk,
      chunkSize,
      method = "get",
      parameterName = null
    }) =>
      await Promise.all(
        await Array.from({ length: Math.ceil(valuesToChunk.length / chunkSize) }, (v, i) =>
          valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
        ).reduce(async (acc, codeChunk) =>
            (await acc).concat(await (method === "get"
              ? coaApi.get(`${url}${codeChunk.join(",")}`)
              : coaApi.request({
                method,
                url,
                data: { [parameterName]: codeChunk.join(",") }
              }))),
          Promise.resolve([])
        )
      )
  }
};
