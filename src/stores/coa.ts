import { defineStore } from "pinia";

import { getCurrentLocaleShortKey } from "~/composables/locales";
import { cachedCoaApi as coaApi } from "~/util/api";
import { inducks_issue, inducks_issuequotation } from "~db_types/client_coa";
import { InducksIssueDetails } from "~types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~types/InducksIssueQuotationSimple";

import { i18n } from "../i18n";

const URL_PREFIX_COUNTRIES = "/coa/list/countries/LOCALE";
const URL_PREFIX_PUBLICATIONS = "/coa/list/publications";
const URL_PREFIX_ISSUES = "/coa/list/issues";
const URL_PREFIX_AUTHORS = "/coa/authorsfullnames/";
const URL_PREFIX_URLS = "/coa/list/issues/details";
const URL_PREFIX_PUBLICATION_QUOTATIONS = "/coa/quotations/publications";
const URL_ISSUE_COUNTS = "/coa/list/issues/count";
const URL_ISSUE_DECOMPOSE = "/coa/issues/decompose";

const addPartInfo = (issueDetails: InducksIssueDetails) => {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce(
      (acc, { storycode }) => ({
        ...acc,
        [storycode]: !storycode ? 0 : (acc[storycode] || 0) + 1,
      }),
      {} as { [storycode: string]: number }
    )
  )
    .filter(([, occurrences]) => occurrences > 1)
    .reduce(
      (acc, [storycode]) => ({
        ...acc,
        [storycode]: 1,
      }),
      {}
    ) as { [storycode: string]: number };
  return {
    ...issueDetails,
    entries: issueDetails.entries.map((entry) => ({
      ...entry,
      part: storyPartCounter[entry.storycode]
        ? storyPartCounter[entry.storycode]++
        : null,
    })),
  };
};

export const coa = defineStore("coa", {
  state: () => ({
    coverUrls: {} as { [issuenumber: string]: string },
    countryNames: null as { [countrycode: string]: string } | null,
    publicationNames: {} as { [publicationcode: string]: string },
    publicationNamesFullCountries: [] as string[],
    personNames: null as { [personcode: string]: string } | null,
    issueNumbers: {} as { [issuecode: string]: string[] },
    issuesWithTitles: {} as {
      [issuenumber: string]: { issuenumber: string; title: string };
    },
    issueDetails: {} as { [issuecode: string]: InducksIssueDetails },
    isLoadingCountryNames: false as boolean,
    issueCounts: null as { [publicationcode: string]: number } | null,
    issueCodeDetails: null as { [issuecode: string]: inducks_issue } | null,
    issueQuotations: null as {
      [issuecode: string]: InducksIssueQuotationSimple;
    } | null,
  }),

  actions: {
    addPublicationNames(publicationNames: {
      [publicationcode: string]: string;
    }) {
      this.publicationNames = {
        ...this.publicationNames,
        ...publicationNames,
      };
    },
    setPersonNames(personNames: { [personcode: string]: string }) {
      this.personNames = Object.keys(personNames).reduce(
        (acc, personcode) => ({
          ...acc,
          [personcode]: personNames[personcode],
        }),
        {}
      );
    },
    setCoverUrl(issueNumber: string, url: string) {
      this.coverUrls[issueNumber] = url;
    },
    addIssueNumbers(issueNumbers: { [publicationcode: string]: string[] }) {
      this.issueNumbers = { ...this.issueNumbers, ...issueNumbers };
    },
    addIssueCodeDetails(issueCodeDetails: {
      [issuecode: string]: inducks_issue;
    }) {
      this.issueCodeDetails = { ...this.issueCodeDetails, ...issueCodeDetails };
    },
    addIssueQuotations(issueQuotations: {
      [publicationcode: string]: InducksIssueQuotationSimple;
    }) {
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
              "LOCALE",
              getCurrentLocaleShortKey(i18n.global.locale)
            )
          )
        ).data;
        this.isLoadingCountryNames = false;
      }
    },
    async fetchPublicationNames(publicationCodes: string[]) {
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
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) =>
            data.reduce(
              (acc, { data }: { data: { [_: string]: string } }) => ({
                ...acc,
                ...data,
              }),
              {}
            )
          )
        )
      );
    },
    async fetchIssueQuotations(publicationCodes: string[]) {
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
          (await this.getChunkedRequests({
            url: URL_PREFIX_PUBLICATION_QUOTATIONS,
            valuesToChunk: newPublicationCodes,
            chunkSize: 50,
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) =>
            data.reduce(
              (acc, { data }: { data: inducks_issuequotation[] }) => ({
                ...acc,
                ...data.reduce(
                  (issueAcc, issue) => ({
                    ...issueAcc,
                    [`${issue.publicationcode} ${issue.issuenumber}`]: {
                      min: issue.estimationmin,
                      max: issue.estimationmax,
                    },
                  }),
                  {} as { [issuecode: string]: InducksIssueQuotationSimple }
                ),
              }),
              []
            )
          )) as {
            [issuecode: string]: InducksIssueQuotationSimple;
          }
        )
      );
    },
    async fetchPublicationNamesFromCountry(countryCode: string) {
      if (this.publicationNamesFullCountries.includes(countryCode)) return;

      return coaApi
        .get(`${URL_PREFIX_PUBLICATIONS}/${countryCode}`)
        .then(({ data }: { data: { [_: string]: string } }) => {
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
    async fetchPersonNames(personCodes: string[]) {
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
            data.reduce(
              (acc, { data }: { data: { [_: string]: string } }) => ({
                ...acc,
                ...data,
              }),
              {}
            )
          )),
        })
      );
    },

    async fetchIssueNumbersWithTitles(publicationcode: string) {
      this.issuesWithTitles[publicationcode] = (
        await coaApi.get(
          `/coa/list/issues/withTitle?publicationcode=${publicationcode}`
        )
      ).data;
    },

    async fetchIssueNumbers(publicationCodes: string[]) {
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
            chunkSize: 50,
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) =>
            data.reduce(
              (acc, { data }: { data: { [_: string]: string[] } }) => ({
                ...acc,
                ...data,
              }),
              {}
            )
          )
        )
      );
    },

    async fetchIssueCodesDetails(issueCodes: string[]) {
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
            method: "post",
            parameterName: "issueCodes",
          }).then((data) =>
            data.reduce(
              (acc, { data }: { data: { [_: string]: string } }) => ({
                ...acc,
                ...data,
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

    async fetchIssueUrls({
      publicationCode,
      issueNumber,
    }: {
      publicationCode: string;
      issueNumber: string;
    }) {
      const issueCode = `${publicationCode} ${issueNumber}`;
      if (!this.issueDetails[issueCode]) {
        const issueDetails = (
          await coaApi.get(
            `${URL_PREFIX_URLS}?publicationcode=${publicationCode}&issuenumber=${issueNumber}`
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
      chunkOnQueryParam = false,
      method = "get",
      parameterName = "null",
    }: {
      url: string;
      valuesToChunk: string[];
      chunkSize: number;
      chunkOnQueryParam?: boolean;
      method?: string;
      parameterName?: string;
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
              await (method === "get"
                ? coaApi.get(
                    `${url}${
                      chunkOnQueryParam ? `?${parameterName}=` : ""
                    }${codeChunk.join(",")}`
                  )
                : coaApi.request({
                    method,
                    url,
                    data: { [parameterName]: codeChunk.join(",") },
                  }))
            ),
          Promise.resolve([])
        )
      );
    },
  },
});
