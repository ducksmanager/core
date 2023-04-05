import { defineStore } from "pinia";

import {
  GET__coa__list__countries__$locale,
  GET__coa__list__issues__by_publication_codes,
  GET__coa__list__publications,
  GET__coa__list__publications__$countrycode,
} from "~dm_types/routes";

import { call, getChunkedRequests } from "../../axios-helper";
import { api } from "./api";

export const coa = defineStore("coa", () => {
  const countryNames = ref(null as { [countrycode: string]: string } | null),
    publicationNames = ref({} as { [publicationcode: string]: string | null }),
    publicationNamesFullCountries = ref([] as string[]),
    personNames = ref(null as { [personcode: string]: string } | null),
    issueNumbers = ref({} as { [publicationcode: string]: string[] }),
    issueDetails = ref({} as { [issuecode: string]: any }),
    isLoadingCountryNames = ref(false as boolean),
    issueCounts = ref(null),
    addPublicationNames = (newPublicationNames: {
      [publicationcode: string]: string | null;
    }) => {
      publicationNames.value = {
        ...publicationNames.value,
        ...newPublicationNames,
      };
    },
    addIssueNumbers = (newIssueNumbers: {
      [publicationcode: string]: string[];
    }) => {
      issueNumbers.value = { ...issueNumbers.value, ...newIssueNumbers };
    },
    fetchCountryNames = async (locale: string) => {
      if (!isLoadingCountryNames.value && !countryNames.value) {
        isLoadingCountryNames.value = true;

        countryNames.value = (
          await call(
            api().dmApi,
            new GET__coa__list__countries__$locale({
              query: { countryCodes: null },
              params: { locale: locale.split("-")[0] },
            })
          )
        ).data;
      }
    },
    fetchPublicationNames = async (publicationCodes: string[]) => {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationcode) =>
              !Object.keys(publicationNames.value).includes(publicationcode)
          )
        ),
      ];
      return (
        newPublicationCodes.length &&
        addPublicationNames(
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
    fetchPublicationNamesFromCountry = async (countryCode: string) => {
      if (publicationNamesFullCountries.value.includes(countryCode)) {
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
      addPublicationNames({
        ...(publicationNames.value || {}),
        ...data,
      });
      publicationNamesFullCountries.value = [
        ...publicationNamesFullCountries.value,
        countryCode,
      ];
    },
    fetchIssueNumbers = async (publicationCodes: string[]) => {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationcode) =>
              !Object.keys(issueNumbers.value || {}).includes(publicationcode)
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

        addIssueNumbers(
          data.reduce(
            (acc, issue) => ({
              ...acc,
              [issue.publicationcode]: [
                ...(acc[issue.publicationcode] || []),
                issue.issuenumber,
              ],
            }),
            {} as typeof issueNumbers.value
          )
        );
      }
    };
  return {
    countryNames,
    publicationNames,
    publicationNamesFullCountries,
    personNames,
    issueNumbers,
    issueDetails,
    isLoadingCountryNames,
    issueCounts,
    addPublicationNames,
    addIssueNumbers,
    fetchCountryNames,
    fetchPublicationNames,
    fetchPublicationNamesFromCountry,
    fetchIssueNumbers,
  };
});
