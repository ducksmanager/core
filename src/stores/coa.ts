import { defineStore } from "pinia";

import { getCurrentLocaleShortKey } from "~/composables/locales";
import i18n from "~/i18n";
import { cachedCoaApi as coaApi } from "~/util/api";
import { call, getChunkedRequests } from "~/util/axios";
import { inducks_issue } from "~prisma_clients/client_coa";
import { InducksIssueDetails } from "~types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~types/InducksIssueQuotationSimple";
import {
  GET__coa__authorsfullnames__$authors,
  GET__coa__list__countries__$locale,
  GET__coa__list__issues__by_publication_codes,
  GET__coa__list__issues__count,
  GET__coa__list__issues__details,
  GET__coa__list__issues__withTitle,
  GET__coa__list__publications,
  GET__coa__list__publications__$countrycode,
  GET__coa__quotations__publications,
  POST__coa__issues__decompose,
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
    publicationNames: {} as GET__coa__list__publications["resBody"],
    publicationNamesFullCountries: [] as string[],
    personNames: null as { [personcode: string]: string } | null,
    issueNumbers: {} as { [issuecode: string]: string[] },
    issuesWithTitles: {} as {
      [issuenumber: string]: GET__coa__list__issues__withTitle["resBody"];
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
    addPublicationNames(publicationNames: typeof this.publicationNames) {
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
          await call(
            coaApi,
            new GET__coa__list__countries__$locale({
              query: { countryCodes: null },
              params: { locale },
            })
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
          await getChunkedRequests<GET__coa__list__publications>({
            callFn: (chunk) =>
              call(
                coaApi,
                new GET__coa__list__publications({
                  query: { publicationCodes: chunk },
                })
              ),
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
          await getChunkedRequests<GET__coa__quotations__publications>({
            callFn: (chunk) =>
              call(
                coaApi,
                new GET__coa__quotations__publications({
                  query: { publicationCodes: chunk },
                })
              ),
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

      return call(
        coaApi,
        new GET__coa__list__publications__$countrycode({
          params: { countrycode },
        })
      ).then(({ data }) => {
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
          ...(await getChunkedRequests<GET__coa__authorsfullnames__$authors>({
            callFn: (chunk) =>
              call(
                coaApi,
                new GET__coa__authorsfullnames__$authors({
                  params: { authors: chunk },
                })
              ),
            valuesToChunk: newPersonNames,
            chunkSize: 10,
          })),
        })
      );
    },

    async fetchIssueNumbersWithTitles(publicationcode: string) {
      this.issuesWithTitles[publicationcode] = (
        await call(
          coaApi,
          new GET__coa__list__issues__withTitle({
            query: { publicationcode },
          })
        )
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
          await getChunkedRequests<GET__coa__list__issues__by_publication_codes>(
            {
              callFn: async (chunk) =>
                call(
                  coaApi,
                  new GET__coa__list__issues__by_publication_codes({
                    query: { publicationCodes: chunk },
                  })
                ),
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
          await getChunkedRequests<POST__coa__issues__decompose>({
            callFn: (chunk) =>
              call(
                coaApi,
                new POST__coa__issues__decompose({
                  reqBody: { issueCodes: chunk },
                })
              ),
            valuesToChunk: newIssueCodes,
            chunkSize: 50,
          })
        )
      );
    },

    async fetchIssueCounts() {
      if (!this.issueCounts)
        this.issueCounts = (
          await call(coaApi, new GET__coa__list__issues__count({}))
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
          await call(
            coaApi,
            new GET__coa__list__issues__details({
              query: { publicationcode, issuenumber },
            })
          )
        ).data;

        this.issueDetails = {
          ...this.issueDetails,
          [issueCode]: addPartInfo(issueDetails),
        };
      }
    },
  },
});
