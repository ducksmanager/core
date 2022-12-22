import { defineStore } from "pinia";

import { getCurrentLocaleShortKey } from "~/composables/locales";
import { i18n } from "~/i18n";
import { cachedCoaApi as coaApi } from "~/util/api";
import { inducks_issue } from "~prisma_clients/client_coa";
import { InducksIssueDetails } from "~types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~types/InducksIssueQuotationSimple";

const URL_PREFIX_COUNTRIES = "/coa/list/countries/LOCALE";
import type { getType as URL_PREFIX_COUNTRIES_TYPE } from "~routes/coa/list/countries/:locale";

const URL_PREFIX_PUBLICATIONS = "/coa/list/publications";
import type { getType as URL_PREFIX_PUBLICATIONS_TYPE } from "~routes/coa/list/publications";

const URL_PREFIX_ISSUES = "/coa/list/issues";
import type { getType as URL_PREFIX_ISSUES_TYPE } from "~routes/coa/list/issues";

const URL_PREFIX_AUTHORS = "/coa/authorsfullnames/";
import type { getType as URL_PREFIX_AUTHORS_TYPE } from "~routes/coa/authorsfullnames/:authors";

const URL_PREFIX_URLS = "/coa/list/issues/details";
import type { getType as URL_PREFIX_URLS_TYPE } from "~routes/coa/list/issues/details";

const URL_PREFIX_PUBLICATION_QUOTATIONS = "/coa/quotations/publications";
import type { getType as URL_PREFIX_PUBLICATION_QUOTATIONS_TYPE } from "~routes/coa/quotations/publications";

const URL_ISSUE_COUNTS = "/coa/list/issues/count";
import type { getType as URL_ISSUE_COUNTS_TYPE } from "~routes/coa/list/issues/count";

const URL_ISSUE_DECOMPOSE = "/coa/issues/decompose";
import type { postType as URL_ISSUE_DECOMPOSE_TYPE } from "~routes/coa/issues/decompose";

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
    publicationNames: {} as { [publicationcode: string]: string | null },
    publicationNamesFullCountries: [] as string[],
    personNames: null as { [personcode: string]: string } | null,
    issueNumbers: {} as { [issuecode: string]: string[] },
    issuesWithTitles: {} as {
      [issuenumber: string]: { issuenumber: string; title: string }[];
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
      [publicationcode: string]: string | null;
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
    setCoverUrl(issuenumber: string, url: string) {
      this.coverUrls[issuenumber] = url;
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
          await coaApi.get<URL_PREFIX_COUNTRIES_TYPE>(
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
            (publicationcode) =>
              !Object.keys(this.publicationNames).includes(publicationcode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addPublicationNames(
          await this.getChunkedRequests<URL_PREFIX_PUBLICATIONS_TYPE>({
            url: URL_PREFIX_PUBLICATIONS,
            valuesToChunk: newPublicationCodes,
            chunkSize: 20,
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) => {
            console.log(data);
            return data.reduce(
              (acc, data2) => ({
                ...acc,
                ...data2,
              }),
              {}
            );
          })
        )
      );
    },
    async fetchIssueQuotations(publicationCodes: string[]) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationcode) =>
              !Object.keys(this.issueQuotations || {}).includes(publicationcode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addIssueQuotations(
          (await this.getChunkedRequests<URL_PREFIX_PUBLICATION_QUOTATIONS_TYPE>(
            {
              url: URL_PREFIX_PUBLICATION_QUOTATIONS,
              valuesToChunk: newPublicationCodes,
              chunkSize: 50,
              chunkOnQueryParam: true,
              parameterName: "publicationCodes",
            }
          ).then((data) =>
            data.reduce(
              (acc, data) => ({
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
        .get<URL_PREFIX_COUNTRIES_TYPE>(
          `${URL_PREFIX_PUBLICATIONS}/${countryCode}`
        )
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
          ...(await this.getChunkedRequests<URL_PREFIX_AUTHORS_TYPE>({
            url: URL_PREFIX_AUTHORS,
            valuesToChunk: newPersonNames,
            chunkSize: 10,
          }).then((data) =>
            data.reduce(
              (acc, data) => ({
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
            (publicationcode) =>
              !Object.keys(this.issueNumbers || {}).includes(publicationcode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addIssueNumbers(
          await this.getChunkedRequests<URL_PREFIX_ISSUES_TYPE>({
            url: URL_PREFIX_ISSUES,
            valuesToChunk: newPublicationCodes,
            chunkSize: 50,
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) =>
            data.reduce(
              (acc, data) => ({
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
          await this.getChunkedRequests<URL_ISSUE_DECOMPOSE_TYPE>({
            url: URL_ISSUE_DECOMPOSE,
            valuesToChunk: newIssueCodes,
            chunkSize: 50,
            method: "post",
            parameterName: "issueCodes",
          }).then((data) =>
            data.reduce(
              (acc, data) => ({
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
        this.issueCounts = (
          await coaApi.get<URL_ISSUE_COUNTS_TYPE>(URL_ISSUE_COUNTS)
        ).data;
    },

    async fetchIssueUrls({
      publicationcode,
      issuenumber,
    }: {
      publicationcode: string;
      issuenumber: string;
    }) {
      const issueCode = `${publicationcode} ${issuenumber}`;
      if (!this.issueDetails[issueCode]) {
        const issueDetails = (
          await coaApi.get<URL_PREFIX_URLS_TYPE>(
            `${URL_PREFIX_URLS}?publicationcode=${publicationcode}&issuenumber=${issuenumber}`
          )
        ).data;

        this.issueDetails = {
          ...this.issueDetails,
          [issueCode]: addPartInfo(issueDetails),
        };
      }
    },

    async getChunkedRequests<ResponseType>({
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
    }): Promise<ResponseType[]> {
      let acc: ResponseType[] = [];
      const slices = Array.from(
        { length: Math.ceil(valuesToChunk.length / chunkSize) },
        (v, i) => valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
      );
      for (const slice of slices) {
        acc = acc.concat(
          (
            await (method === "get"
              ? coaApi.get<ResponseType>(
                  `${url}${
                    chunkOnQueryParam ? `?${parameterName}=` : ""
                  }${slice.join(",")}`
                )
              : coaApi.request<ResponseType>({
                  method,
                  url,
                  data: { [parameterName]: slice.join(",") },
                }))
          ).data
        );
      }
      return acc;
    },
  },
});
