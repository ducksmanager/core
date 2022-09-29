import { defineStore } from "pinia";

import { InducksIssueDetails } from "~/types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~/types/InducksIssueQuotationSimple";
import { cachedCoaApi as coaApi } from "~/util/api";
import { inducks_issue, inducks_issuequotation } from "~db_types/client_coa";

const URL_PREFIX_COUNTRIES = "/coa/list/countries/LOCALE";
const URL_PREFIX_PUBLICATIONS = "/coa/list/publications/";
const URL_PREFIX_ISSUES = "/coa/list/issues/multiple/";
const URL_PREFIX_AUTHORS = "/coa/authorsfullnames/";
const URL_PREFIX_URLS = "/coa/list/details/";
const URL_PREFIX_PUBLICATION_QUOTATIONS = "/coa/quotations/publications";
const URL_ISSUE_COUNTS = "/coa/list/issues/count";
const URL_ISSUE_DECOMPOSE = "/coa/issues/decompose";

function addPartInfo(issueDetails: InducksIssueDetails) {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce(
      (acc, { storycode }) => ({
        ...acc,
        [storycode]: !storycode ? 0 : (acc[storycode] || 0) + 1,
      }),
      {} as { [key: string]: number }
    )
  )
    .filter(([, occurrences]) => occurrences > 1)
    .reduce(
      (acc, [storycode]) => ({
        ...acc,
        [storycode]: 1,
      }),
      {}
    ) as { [key: string]: number };
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

export const coa = defineStore("coa", {
  state: () => ({
    coverUrls: {} as { [key: string]: string },
    countryNames: null as { [key: string]: string } | null,
    publicationNames: {} as { [key: string]: string },
    publicationNamesFullCountries: [] as string[],
    personNames: null as { [key: string]: string } | null,
    issueNumbers: {} as { [key: string]: string },
    issueDetails: {} as { [key: string]: InducksIssueDetails },
    isLoadingCountryNames: false,
    issueCounts: null,
    issueCodeDetails: null as { [key: string]: inducks_issue } | null,
    issueQuotations: null as {
      [key: string]: InducksIssueQuotationSimple;
    } | null,
    loadingIssueDetails: {},
  }),

  actions: {
    addPublicationNames(publicationNames: { [key: string]: string }) {
      this.publicationNames = {
        ...this.publicationNames,
        ...publicationNames,
      };
    },
    setPersonNames(personNames: { [key: string]: string }) {
      this.personNames = Object.keys(personNames).reduce(
        (acc, personCode) => ({
          ...acc,
          [personCode]: personNames[personCode],
        }),
        {}
      );
    },
    setCoverUrl(issueNumber: string, url: string) {
      this.coverUrls[issueNumber] = url;
    },
    addIssueNumbers(issueNumbers: { [key: string]: string }) {
      this.issueNumbers = { ...this.issueNumbers, ...issueNumbers };
    },
    addIssueCodeDetails(issueCodeDetails: { [key: string]: inducks_issue }) {
      this.issueCodeDetails = { ...this.issueCodeDetails, ...issueCodeDetails };
    },
    addIssueQuotations(issueQuotations: {
      [key: string]: InducksIssueQuotationSimple;
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
              localStorage.getItem("locale") || "en"
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
          }).then((data) =>
            data.reduce(
              (acc, { data }: { data: any }) => ({ ...acc, ...data }),
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
                  {} as { [key: string]: InducksIssueQuotationSimple }
                ),
              }),
              []
            )
          )) as {
            [key: string]: InducksIssueQuotationSimple;
          }
        )
      );
    },
    async fetchPublicationNamesFromCountry(countryCode: string) {
      if (this.publicationNamesFullCountries.includes(countryCode)) return;

      return coaApi
        .get(URL_PREFIX_PUBLICATIONS + countryCode)
        .then(({ data }: { data: any }) => {
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
              (acc, { data }: { data: any }) => ({ ...acc, ...data }),
              {}
            )
          )),
        })
      );
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
            chunkSize: 10,
          }).then((data) =>
            data.reduce(
              (acc, { data }: { data: any }) => ({ ...acc, ...data }),
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
              (acc, { data }: { data: any }) => ({
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
