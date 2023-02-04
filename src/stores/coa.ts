import { AxiosResponse } from "axios";
import { defineStore } from "pinia";

import { getCurrentLocaleShortKey } from "~/composables/locales";
import i18n from "~/i18n";
import { cachedCoaApi as coaApi } from "~/util/api";
import { inducks_issue } from "~prisma_clients/client_coa";
import { Call } from "~types/Call";
import { InducksIssueDetails } from "~types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~types/InducksIssueQuotationSimple";
import {
  GET_CALL_COA_AUTHORSFULLNAMES__AUTHORS,
  GET_CALL_COA_LIST_ISSUES_BY_PUBLICATION_CODES,
  GET_CALL_COA_LIST_PUBLICATIONS,
  GET_CALL_COA_QUOTATIONS_PUBLICATIONS,
  POST_CALL_COA_ISSUES_DECOMPOSE,
} from "~types/routes";

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
      [issuenumber: string]: { issuenumber: string; title: string | null }[];
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

    async fetchCountryNames(afterUpdate = false) {
      if ((!this.isLoadingCountryNames && !this.countryNames) || afterUpdate) {
        this.isLoadingCountryNames = true;
        const locale = getCurrentLocaleShortKey(
          (i18n.global.locale as unknown as { value: string }).value
        );
        this.countryNames = (
          await GET__coa__list__countries__$locale(coaApi, {
            params: {
              countryCodes: null,
            },
            urlParams: {
              locale,
            },
          })
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
          await this.getChunkedRequests<GET_CALL_COA_LIST_PUBLICATIONS>({
            callFn: (chunk) =>
              GET__coa__list__publications(coaApi, {
                params: { publicationCodes: chunk },
              }),
            valuesToChunk: newPublicationCodes,
            chunkSize: 20,
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
          await this.getChunkedRequests<GET_CALL_COA_QUOTATIONS_PUBLICATIONS>({
            callFn: (chunk) =>
              GET__coa__quotations__publications(coaApi, {
                params: { publicationCodes: chunk },
              }),
            valuesToChunk: newPublicationCodes,
            chunkSize: 50,
          }).then((data) =>
            data.reduce(
              (issueAcc, issue) => ({
                ...issueAcc,
                [`${issue.publicationcode} ${issue.issuenumber}`]: {
                  min: issue.estimationmin,
                  max: issue.estimationmax,
                },
              }),
              {} as { [issuecode: string]: InducksIssueQuotationSimple }
            )
          )
        )
      );
    },
    async fetchPublicationNamesFromCountry(countrycode: string) {
      if (this.publicationNamesFullCountries.includes(countrycode)) return;

      return GET__coa__list__publications__$countrycode(coaApi, {
        urlParams: { countrycode },
      }).then(({ data }) => {
        this.addPublicationNames({
          ...(this.publicationNames || {}),
          ...data,
        });
        this.publicationNamesFullCountries = [
          ...this.publicationNamesFullCountries,
          countrycode,
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
          ...(await this.getChunkedRequests<GET_CALL_COA_AUTHORSFULLNAMES__AUTHORS>(
            {
              callFn: (chunk) =>
                GET__coa__authorsfullnames__$authors(coaApi, {
                  urlParams: { authors: chunk },
                }),
              valuesToChunk: newPersonNames,
              chunkSize: 10,
            }
          )),
        })
      );
    },

    async fetchIssueNumbersWithTitles(publicationcode: string) {
      this.issuesWithTitles[publicationcode] = (
        await GET__coa__list__issues__withTitle(coaApi, {
          params: { publicationcode },
        })
      ).data;
    },

    fetchIssueNumbers: async function (publicationCodes: string[]) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationcode) =>
              !Object.keys(this.issueNumbers || {}).includes(publicationcode)
          )
        ),
      ];
      if (newPublicationCodes.length) {
        const data =
          await this.getChunkedRequests<GET_CALL_COA_LIST_ISSUES_BY_PUBLICATION_CODES>(
            {
              callFn: async (chunk) =>
                GET__coa__list__issues__by_publication_codes(coaApi, {
                  params: { publicationCodes: chunk },
                }),
              valuesToChunk: newPublicationCodes,
              chunkSize: 50,
            }
          );

        this.addIssueNumbers(
          data.reduce(
            (acc, issue) => ({
              ...acc,
              [issue.publicationcode]: [
                ...(acc[issue.publicationcode] || []),
                issue.issuenumber,
              ],
            }),
            {} as typeof this.issueNumbers
          )
        );
      }
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
          await this.getChunkedRequests<POST_CALL_COA_ISSUES_DECOMPOSE>({
            callFn: (chunk) =>
              POST__coa__issues__decompose(coaApi, {
                params: {
                  issueCodes: chunk,
                },
              }),
            valuesToChunk: newIssueCodes,
            chunkSize: 50,
          })
        )
      );
    },

    async fetchIssueCounts() {
      if (!this.issueCounts)
        this.issueCounts = (await GET__coa__list__issues__count(coaApi)).data;
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
          await GET__coa__list__issues__details(coaApi, {
            params: { publicationcode, issuenumber },
          })
        ).data;

        this.issueDetails = {
          ...this.issueDetails,
          [issueCode]: addPartInfo(issueDetails),
        };
      }
    },

    async getChunkedRequests<MyCall extends Call<unknown, unknown>>({
      callFn,
      valuesToChunk,
      chunkSize,
    }: {
      callFn: (chunk: string) => Promise<AxiosResponse<MyCall["resBody"]>>;
      valuesToChunk: string[];
      chunkSize: number;
      chunkOnQueryParam?: boolean;
      parameterName?: string;
    }): Promise<MyCall["resBody"]> {
      const slices = Array.from(
        { length: Math.ceil(valuesToChunk.length / chunkSize) },
        (_, i) => valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
      );
      let acc: MyCall["resBody"] = (await callFn(slices[0].join(","))).data;
      for (const slice of slices.slice(1)) {
        acc = Array.isArray(acc)
          ? [
              ...(acc as never[]),
              ...((await callFn(slice.join(","))).data as never[]),
            ]
          : {
              ...(acc as { [key: string]: never }),
              ...((await callFn(slice.join(","))).data as {
                [key: string]: never;
              }),
            };
      }
      return acc;
    },
  },
});
