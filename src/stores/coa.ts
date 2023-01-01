import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { defineStore } from "pinia";

import { getCurrentLocaleShortKey } from "~/composables/locales";
import i18n from "~/i18n";
import { cachedCoaApi as coaApi } from "~/util/api";
import { inducks_issue } from "~prisma_clients/client_coa";
import { InducksIssueDetails } from "~types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~types/InducksIssueQuotationSimple";
import routes from "~types/routes";

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
          await routes["GET /coa/list/countries/:locale"](coaApi, {
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
          await this.getChunkedRequests({
            call: routes["GET /coa/list/publications"],
            valuesToChunk: newPublicationCodes,
            chunkSize: 20,
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) =>
            data.reduce(
              (acc, data2) => ({
                ...acc,
                ...data2,
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
            (publicationcode) =>
              !Object.keys(this.issueQuotations || {}).includes(publicationcode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        this.addIssueQuotations(
          (await this.getChunkedRequests({
            call: routes["GET /coa/quotations/publications"],
            valuesToChunk: newPublicationCodes,
            chunkSize: 50,
            chunkOnQueryParam: true,
            parameterName: "publicationCodes",
          }).then((data) =>
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
    async fetchPublicationNamesFromCountry(countrycode: string) {
      if (this.publicationNamesFullCountries.includes(countrycode)) return;

      return routes["GET /coa/list/publications/:countrycode"](coaApi, {
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
          ...(await this.getChunkedRequests({
            call: routes["GET /coa/authorsfullnames/:authors"],
            valuesToChunk: newPersonNames,
            chunkSize: 10,
            parameterName: "authors",
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
        await routes["GET /coa/list/issues/withTitle"](coaApi, {
          params: { publicationcode },
        })
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
      if (newPublicationCodes.length) {
        const data = await this.getChunkedRequests({
          call: routes["GET /coa/list/issues"],
          valuesToChunk: newPublicationCodes,
          chunkSize: 50,
          chunkOnQueryParam: true,
          parameterName: "publicationCodes",
        });

        const issueNumbers = {} as typeof this.issueNumbers;

        for (const resultChuck of data) {
          for (const issue of resultChuck) {
            if (!issueNumbers[issue.publicationcode]) {
              issueNumbers[issue.publicationcode] = [];
            }
            issueNumbers[issue.publicationcode].push(issue.issuenumber);
          }
        }
        this.addIssueNumbers(issueNumbers);
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
          await this.getChunkedRequests({
            call: routes["POST /coa/issues/decompose"],
            valuesToChunk: newIssueCodes,
            chunkSize: 50,
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
          await routes["GET /coa/list/issues/count"](coaApi)
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
          await routes["GET /coa/list/issues/details"](coaApi, {
            params: { publicationcode, issuenumber },
          })
        ).data;

        this.issueDetails = {
          ...this.issueDetails,
          [issueCode]: addPartInfo(issueDetails),
        };
      }
    },

    async getChunkedRequests<Type extends object>({
      call,
      valuesToChunk,
      chunkSize,
      chunkOnQueryParam = false,
      parameterName = "null",
    }: {
      call: (
        axios: AxiosInstance,
        config?: AxiosRequestConfig
      ) => Promise<AxiosResponse<Type>>;
      valuesToChunk: string[];
      chunkSize: number;
      chunkOnQueryParam?: boolean;
      parameterName?: string;
    }): Promise<Type[]> {
      let acc: Type[] = [];
      const slices = Array.from(
        { length: Math.ceil(valuesToChunk.length / chunkSize) },
        (v, i) => valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
      );
      for (const slice of slices) {
        acc = acc.concat(
          (
            await call(coaApi, {
              data: { [parameterName]: slice.join(",") },
              [chunkOnQueryParam ? "params" : "urlParams"]: {
                [parameterName]: slice.join(","),
              },
            })
          ).data
        );
      }
      return acc;
    },
  },
});
