import { defineStore } from 'pinia';

import { cachedCoaApi as coaApi } from '~/util/cache';

const URL_PREFIX_COUNTRIES = '/api/coa/list/countries/LOCALE';
const URL_PREFIX_PUBLICATIONS = '/api/coa/list/publications/';
const URL_PREFIX_ISSUES = '/api/coa/list/issues/multiple/';
const URL_PREFIX_AUTHORS = '/api/coa/authorsfullnames/';
const URL_PREFIX_URLS = '/api/coa/list/details/';
const URL_PREFIX_ISSUE_QUOTATIONS = '/api/coa/quotations/';
const URL_ISSUE_COUNTS = '/api/coa/list/issues/count';
const URL_ISSUE_DECOMPOSE = '/api/coa/issues/decompose';

function addPartInfo(issueDetails) {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce(
      (acc, { storycode }) => ({
        ...acc,
        [storycode]: !storycode ? 0 : (acc[storycode] || 0) + 1,
      }),
      {}
    )
  )
    .filter(([, occurrences]) => occurrences > 1)
    .reduce(
      (acc, [storycode]) => ({
        ...acc,
        [storycode]: 1,
      }),
      {}
    );
  return {
    ...issueDetails,
    entries: issueDetails.entries.map((entry) => ({
      ...entry,
      part: storyPartCounter[entry.storycode]
        ? storyPartCounter[entry.storycode]++
        : null,
    })),
  };
}

export const coa = defineStore('coa', {
  state: () => ({
    coverUrls: {},
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
    loadingIssueDetails: {},
  }),

  actions: {
    addPublicationNames(publicationNames) {
      this.publicationNames = {
        ...this.publicationNames,
        ...publicationNames,
      };
    },
    setPersonNames(personNames) {
      this.personNames = Object.keys(personNames).reduce(
        (acc, personCode) => ({
          ...acc,
          [personCode]: personNames[personCode],
        }),
        {}
      );
    },
    setCoverUrl(issueNumber, url) {
      this.coverUrls[issueNumber] = url;
    },
    addIssueNumbers(issueNumbers) {
      this.issueNumbers = { ...this.issueNumbers, ...issueNumbers };
    },
    addIssueCodeDetails(issueCodeDetails) {
      this.issueCodeDetails = { ...this.issueCodeDetails, ...issueCodeDetails };
    },
    addIssueQuotations(issueQuotations) {
      this.issueQuotations = {
        ...(this.issueQuotations || {}),
        ...issueQuotations,
      };
    },

    async fetchCountryNames() {
      if (!this.isLoadingCountryNames && !this.countryNames) {
        this.isLoadingCountryNames = true;
        this.countryNames = (
          await coaApi.get(
            URL_PREFIX_COUNTRIES.replace(
              'LOCALE',
              localStorage.getItem('locale')
            )
          )
        ).data;
        this.isLoadingCountryNames = false;
      }
    },
    async fetchPublicationNames(publicationCodes) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationCode) =>
              !Object.keys(this.publicationNames).includes(publicationCode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addPublicationNames(
          await this.getChunkedRequests({
            url: URL_PREFIX_PUBLICATIONS,
            valuesToChunk: newPublicationCodes,
            chunkSize: 20,
          }).then((data) =>
            data.reduce((acc, result) => ({ ...acc, ...result.data }), {})
          )
        )
      );
    },
    async fetchIssueQuotations(publicationCodes) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationCode) =>
              !Object.keys(this.issueQuotations || {}).includes(publicationCode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addIssueQuotations(
          await this.getChunkedRequests({
            url: URL_PREFIX_ISSUE_QUOTATIONS,
            valuesToChunk: newPublicationCodes,
            chunkSize: 10,
          }).then((data) =>
            data.reduce(
              (acc, result) => ({
                ...acc,
                ...result.data.reduce(
                  (issueAcc, issue) => ({
                    ...issueAcc,
                    [`${issue.publicationcode} ${issue.issuenumber}`]: {
                      min: issue.estimationmin,
                      max: issue.estimationmax,
                    },
                  }),
                  {}
                ),
              }),
              []
            )
          )
        )
      );
    },
    async fetchPublicationNamesFromCountry(countryCode) {
      if (this.publicationNamesFullCountries.includes(countryCode)) return;

      return coaApi
        .get(URL_PREFIX_PUBLICATIONS + countryCode)
        .then(({ data }) => {
          this.addPublicationNames({
            ...(this.publicationNames || {}),
            ...data,
          });
          this.publicationNamesFullCountries = [
            ...this.publicationNamesFullCountries,
            countryCode,
          ];
        });
    },
    async fetchPersonNames(personCodes) {
      const newPersonNames = [
        ...new Set(
          personCodes.filter(
            (personCode) =>
              !Object.keys(this.personNames || {}).includes(personCode)
          )
        ),
      ];
      return (
        newPersonNames.length &&
        this.setPersonNames({
          ...(this.personNames || {}),
          ...(await this.getChunkedRequests({
            url: URL_PREFIX_AUTHORS,
            valuesToChunk: newPersonNames,
            chunkSize: 10,
          }).then((data) =>
            data.reduce((acc, result) => ({ ...acc, ...result.data }), {})
          )),
        })
      );
    },

    async fetchIssueNumbers(publicationCodes) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationCode) =>
              !Object.keys(this.issueNumbers || {}).includes(publicationCode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addIssueNumbers(
          await this.getChunkedRequests({
            url: URL_PREFIX_ISSUES,
            valuesToChunk: newPublicationCodes,
            chunkSize: 10,
          }).then((data) =>
            data.reduce((acc, result) => ({ ...acc, ...result.data }), {})
          )
        )
      );
    },

    async fetchIssueCodesDetails(issueCodes) {
      const newIssueCodes = [
        ...new Set(
          issueCodes.filter(
            (issueCode) =>
              !Object.keys(this.issueCodeDetails || {}).includes(issueCode)
          )
        ),
      ];
      return (
        newIssueCodes.length &&
        this.addIssueCodeDetails(
          await this.getChunkedRequests({
            url: URL_ISSUE_DECOMPOSE,
            valuesToChunk: newIssueCodes,
            chunkSize: 50,
            method: 'post',
            parameterName: 'issueCodes',
          }).then((data) =>
            data.reduce(
              (acc, result) => ({
                ...acc,
                ...result.data,
              }),
              {}
            )
          )
        )
      );
    },

    async fetchIssueCounts() {
      if (!this.issueCounts)
        this.issueCounts = (await coaApi.get(URL_ISSUE_COUNTS)).data;
    },

    async fetchIssueUrls({ publicationCode, issueNumber }) {
      const issueCode = `${publicationCode} ${issueNumber}`;
      if (!this.issueDetails[issueCode]) {
        const issueDetails = (
          await coaApi.get(
            `${URL_PREFIX_URLS + publicationCode}/${issueNumber}`
          )
        ).data;

        this.issueDetails = {
          ...this.issueDetails,
          [issueCode]: addPartInfo(issueDetails),
        };
      }
    },

    async getChunkedRequests({
      url,
      valuesToChunk,
      chunkSize,
      method = 'get',
      parameterName = null,
    }) {
      return await Promise.all(
        await Array.from(
          { length: Math.ceil(valuesToChunk.length / chunkSize) },
          (v, i) =>
            valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
        ).reduce(
          async (acc, codeChunk) =>
            (
              await acc
            ).concat(
              await (method === 'get'
                ? coaApi.get(`${url}${codeChunk.join(',')}`)
                : coaApi.request({
                    method,
                    url,
                    data: { [parameterName]: codeChunk.join(',') },
                  }))
            ),
          Promise.resolve([])
        )
      );
    },
  },
});
