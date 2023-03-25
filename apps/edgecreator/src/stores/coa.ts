import { defineStore } from "pinia";

import { call, getChunkedRequests } from "~/util/axios";

import { api } from "./api";

export const coa = defineStore("coa", {
  state: () => ({
    countryNames: null as { [countrycode: string]: string } | null,
    publicationNames: {} as { [publicationcode: string]: string | null },
    publicationNamesFullCountries: [] as string[],
    personNames: null as { [personcode: string]: string } | null,
    issueNumbers: {} as { [publicationcode: string]: string[] },
    issueDetails: {} as { [issuecode: string]: any },
    isLoadingCountryNames: false as boolean,
    issueCounts: null,
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
    addIssueNumbers(issueNumbers: { [publicationcode: string]: string[] }) {
      this.issueNumbers = { ...this.issueNumbers, ...issueNumbers };
    },

    async fetchCountryNames(locale: string) {
      if (!this.isLoadingCountryNames && !this.countryNames) {
        this.isLoadingCountryNames = true;

        this.countryNames = (
          await call(
            api().dmApi,
            new GET__coa__list__countries__$locale({
              query: { countryCodes: null },
              params: { locale },
            })
          )
        ).data;
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
            callFn: async (chunk: string) =>
              call(
                api().dmApi,
                new GET__coa__list__publications({
                  query: {
                    publicationCodes: chunk,
                  },
                })
              ),
            valuesToChunk: newPublicationCodes,
            chunkSize: 20,
          })
        )
      );
    },
    async fetchPublicationNamesFromCountry(countryCode: string) {
      if (this.publicationNamesFullCountries.includes(countryCode)) {
        return;
      }
      const data = (
        await call(
          api().dmApi,
          new GET__coa__list__publications__$countrycode({
            params: {
              countrycode: countryCode,
            },
          })
        )
      ).data;
      this.addPublicationNames({
        ...(this.publicationNames || {}),
        ...data,
      });
      this.publicationNamesFullCountries = [
        ...this.publicationNamesFullCountries,
        countryCode,
      ];
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
              callFn: async (chunk: string) =>
                await call(
                  api().dmApi,
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
  },
});
