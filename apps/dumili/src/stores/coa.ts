import { inducks_issue } from "ducksmanager/api/dist/prisma/client_coa";
import { call, getChunkedRequests } from "ducksmanager/src/util/axios";
import type { InducksIssueDetails } from "ducksmanager/types/InducksIssueDetails";
import type { InducksIssueQuotationSimple } from "ducksmanager/types/InducksIssueQuotationSimple";
import {
  GET__coa__authorsfullnames__$authors,
  GET__coa__list__countries__$locale,
  GET__coa__list__issues__by_publication_codes,
  GET__coa__list__issues__count,
  GET__coa__list__issues__details,
  GET__coa__list__issues__withTitle,
  GET__coa__list__publications__$countrycode,
  GET__coa__quotations__publications,
  POST__coa__issues__decompose,
  POST__coa__list__publications,
} from "ducksmanager/types/routes";
import { defineStore } from "pinia";

import i18n from "~/i18n";
import { cachedCoaApi as coaApi } from "~/util/api";

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

export const coa = defineStore("coa", () => {
  const coverUrls = ref({} as { [issuenumber: string]: string }),
    countryNames = ref(null as { [countrycode: string]: string } | null),
    publicationNames = ref({} as POST__coa__list__publications["resBody"]),
    publicationNamesFullCountries = ref([] as string[]),
    personNames = ref(null as { [personcode: string]: string } | null),
    issueNumbers = ref({} as { [issuecode: string]: string[] }),
    issuesWithTitles = ref(
      {} as {
        [issuenumber: string]: GET__coa__list__issues__withTitle["resBody"];
      }
    ),
    issueDetails = ref({} as { [issuecode: string]: InducksIssueDetails }),
    isLoadingCountryNames = ref(false as boolean),
    issueCounts = ref(null as { [publicationcode: string]: number } | null),
    issueCodeDetails = ref(
      null as { [issuecode: string]: inducks_issue } | null
    ),
    issueQuotations = ref(
      null as {
        [issuecode: string]: InducksIssueQuotationSimple;
      } | null
    ),
    addPublicationNames = (
      newPublicationNames: typeof publicationNames.value
    ) => {
      publicationNames.value = {
        ...publicationNames.value,
        ...newPublicationNames,
      };
    },
    setPersonNames = (newPersonNames: { [personcode: string]: string }) => {
      personNames.value = Object.keys(newPersonNames).reduce(
        (acc, personcode) => ({
          ...acc,
          [personcode]: newPersonNames[personcode],
        }),
        {}
      );
    },
    setCoverUrl = (issuenumber: string, url: string) => {
      coverUrls.value[issuenumber] = url;
    },
    addIssueNumbers = (newIssuenumbers: {
      [publicationcode: string]: string[];
    }) => {
      issueNumbers.value = { ...issueNumbers.value, ...newIssuenumbers };
    },
    addIssueCodeDetails = (newIssueCodeDetails: {
      [issuecode: string]: inducks_issue;
    }) => {
      issueCodeDetails.value = {
        ...issueCodeDetails.value,
        ...newIssueCodeDetails,
      };
    },
    addIssueQuotations = (newIssueQuotations: {
      [publicationcode: string]: InducksIssueQuotationSimple;
    }) => {
      issueQuotations.value = {
        ...(issueQuotations.value || {}),
        ...newIssueQuotations,
      };
    },
    fetchCountryNames = async (afterUpdate = false) => {
      if (
        (!isLoadingCountryNames.value && !countryNames.value) ||
        afterUpdate
      ) {
        isLoadingCountryNames.value = true;
        const locale =
          (i18n.global.locale as unknown as { value: string }).value || "en";
        countryNames.value = (
          await call(
            coaApi,
            new GET__coa__list__countries__$locale({
              query: { countryCodes: null },
              params: { locale },
            })
          )
        ).data;
        isLoadingCountryNames.value = false;
      }
    },
    fetchPublicationNames = async (newPublicationCodes: string[]) => {
      const actualNewPublicationCodes = [
        ...new Set(
          newPublicationCodes.filter(
            (publicationcode) =>
              !Object.keys(publicationNames.value).includes(publicationcode)
          )
        ),
      ];
      return (
        actualNewPublicationCodes.length &&
        addPublicationNames(
          (
            await call(
              coaApi,
              new POST__coa__list__publications({
                reqBody: { publicationCodes: actualNewPublicationCodes },
              })
            )
          ).data
        )
      );
    },
    fetchIssueQuotations = async (newPublicationCodes: string[]) => {
      const actualNewPublicationCodes = [
        ...new Set(
          newPublicationCodes.filter(
            (publicationcode) =>
              !Object.keys(issueQuotations.value || {}).includes(
                publicationcode
              )
          )
        ),
      ];
      return (
        actualNewPublicationCodes.length &&
        addIssueQuotations(
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
    fetchPublicationNamesFromCountry = async (countrycode: string) => {
      if (publicationNamesFullCountries.value.includes(countrycode)) return;

      return call(
        coaApi,
        new GET__coa__list__publications__$countrycode({
          params: { countrycode },
        })
      ).then(({ data }) => {
        addPublicationNames({
          ...(publicationNames.value || {}),
          ...data,
        });
        publicationNamesFullCountries.value = [
          ...publicationNamesFullCountries.value,
          countrycode,
        ];
      });
    },
    fetchPersonNames = async (newPersonCodes: string[]) => {
      const actualNewPersonNames = [
        ...new Set(
          newPersonCodes.filter(
            (personCode) =>
              !Object.keys(personNames.value || {}).includes(personCode)
          )
        ),
      ];
      return (
        actualNewPersonNames.length &&
        setPersonNames({
          ...(personNames.value || {}),
          ...(await getChunkedRequests<GET__coa__authorsfullnames__$authors>({
            callFn: (chunk) =>
              call(
                coaApi,
                new GET__coa__authorsfullnames__$authors({
                  params: { authors: chunk },
                })
              ),
            valuesToChunk: actualNewPersonNames,
            chunkSize: 10,
          })),
        })
      );
    },
    fetchIssueNumbersWithTitles = async (publicationcode: string) => {
      issuesWithTitles.value[publicationcode] = (
        await call(
          coaApi,
          new GET__coa__list__issues__withTitle({
            query: { publicationcode },
          })
        )
      ).data;
    },
    fetchIssueNumbers = async function (publicationCodes: string[]) {
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
    },
    fetchIssueCodesDetails = async (issueCodes: string[]) => {
      const newIssueCodes = [
        ...new Set(
          issueCodes.filter(
            (issueCode) =>
              !Object.keys(issueCodeDetails.value || {}).includes(issueCode)
          )
        ),
      ];
      return (
        newIssueCodes.length &&
        addIssueCodeDetails(
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
    fetchIssueCounts = async () => {
      if (!issueCounts.value)
        issueCounts.value = (
          await call(coaApi, new GET__coa__list__issues__count({}))
        ).data;
    },
    fetchIssueUrls = async ({
      publicationcode,
      issuenumber,
    }: {
      publicationcode: string;
      issuenumber: string;
    }) => {
      const issueCode = `${publicationcode} ${issuenumber}`;
      if (!issueDetails.value[issueCode]) {
        const newIssueDetails = (
          await call(
            coaApi,
            new GET__coa__list__issues__details({
              query: { publicationcode, issuenumber },
            })
          )
        ).data;

        issueDetails.value = {
          ...issueDetails.value,
          [issueCode]: addPartInfo(newIssueDetails),
        };
      }
    };
  return {
    coverUrls,
    countryNames,
    publicationNames,
    publicationNamesFullCountries,
    personNames,
    issueNumbers,
    issuesWithTitles,
    issueDetails,
    isLoadingCountryNames,
    issueCounts,
    issueCodeDetails,
    issueQuotations,
    addPublicationNames,
    setPersonNames,
    setCoverUrl,
    addIssueNumbers,
    addIssueCodeDetails,
    addIssueQuotations,
    fetchCountryNames,
    fetchPublicationNames,
    fetchIssueQuotations,
    fetchPublicationNamesFromCountry,
    fetchPersonNames,
    fetchIssueNumbersWithTitles,
    fetchIssueNumbers,
    fetchIssueCodesDetails,
    fetchIssueCounts,
    fetchIssueUrls,
  };
});
