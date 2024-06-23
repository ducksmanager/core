import type CoaServices from "~dm-services/coa/types";
import { InducksIssueDetails } from "~dm-types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { inducks_issue } from "~prisma-clients/client_coa";
import { EventReturnType } from "~socket.io-services/types";

import { dmSocketInjectionKey } from "../composables/useDmSocket";
import { getCurrentLocaleShortKey } from "../composables/useLocales";

const addPartInfo = (issueDetails: InducksIssueDetails) => {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce(
      (acc, { storycode }) => ({
        ...acc,
        [storycode]: !storycode ? 0 : (acc[storycode] || 0) + 1,
      }),
      {} as { [storycode: string]: number },
    ),
  )
    .filter(([, occurrences]) => occurrences > 1)
    .reduce(
      (acc, [storycode]) => ({
        ...acc,
        [storycode]: 1,
      }),
      {},
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
  const {
    coa: { services: coaServices },
  } = injectLocal(dmSocketInjectionKey)!;

  const locale = useI18n().locale,
    coverUrls = ref<{ [issuenumber: string]: string }>({}),
    countryNames = ref<EventReturnType<CoaServices["getCountryList"]> | null>(
      null,
    ),
    publicationNames = ref<
      EventReturnType<CoaServices["getPublicationListFromCountrycodes"]>
    >({}),
    publicationNamesFullCountries = ref<string[]>([]),
    personNames = ref<EventReturnType<CoaServices["getAuthorList"]> | null>(
      null,
    ),
    issueNumbers = ref<{ [publicationcode: string]: string[] }>({}),
    issuecodes = ref<{ [publicationcode: string]: string[] }>({}),
    issuesWithTitles = ref<EventReturnType<CoaServices["getIssuesWithTitles"]>>(
      {},
    ),
    issueDetails = ref<{ [issuecode: string]: InducksIssueDetails }>({}),
    isLoadingCountryNames = ref(false),
    issueCodeDetails = ref<{ [issuecode: string]: inducks_issue }>({}),
    issueQuotations = ref<{
      [issuecode: string]: InducksIssueQuotationSimple;
    }>({}),
    addPublicationNames = (
      newPublicationNames: typeof publicationNames.value,
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
        {},
      );
    },
    setCoverUrl = (issuenumber: string, url: string) => {
      coverUrls.value[issuenumber] = url;
    },
    addIssueNumbers = (newIssuenumbers: {
      [publicationcode: string]: string[];
    }) => {
      Object.assign(issueNumbers.value, newIssuenumbers);
    },
    addIssuecodes = (newIssuecodes: {
      [publicationcode: string]: string[];
    }) => {
      Object.assign(issuecodes.value, newIssuecodes);
    },
    addIssueCodeDetails = (newIssueCodeDetails: {
      [issuecode: string]: inducks_issue;
    }) => {
      Object.assign(issueCodeDetails.value, newIssueCodeDetails);
    },
    addIssueQuotations = (newIssueQuotations: {
      [publicationcode: string]: InducksIssueQuotationSimple;
    }) => {
      Object.assign(issueQuotations.value, newIssueQuotations);
    },
    fetchCountryNames = async (afterUpdate = false) => {
      if (
        (!isLoadingCountryNames.value && !countryNames.value) ||
        afterUpdate
      ) {
        isLoadingCountryNames.value = true;
        countryNames.value = await coaServices.getCountryList(
          getCurrentLocaleShortKey(locale.value),
          [],
        );
        isLoadingCountryNames.value = false;
      }
    },
    fetchPublicationNames = async (newPublicationCodes: string[]) => {
      const actualNewPublicationCodes = [
        ...new Set(
          newPublicationCodes.filter(
            (publicationcode) =>
              !Object.keys(publicationNames.value).includes(publicationcode),
          ),
        ),
      ];
      return (
        actualNewPublicationCodes.length &&
        addPublicationNames(
          await coaServices.getPublicationListFromPublicationcodeList(
            actualNewPublicationCodes,
          ),
        )
      );
    },
    fetchIssueQuotations = async (newPublicationCodes: string[]) => {
      const actualNewPublicationCodes = [
        ...new Set(
          newPublicationCodes.filter(
            (publicationcode) =>
              !Object.keys(issueQuotations.value || {}).includes(
                publicationcode,
              ),
          ),
        ),
      ];

      const data = await coaServices.getQuotationsByPublicationCodes(
        actualNewPublicationCodes,
      );

      if (data.quotations) {
        addIssueQuotations(
          data.quotations.reduce(
            (issueAcc, issue) => ({
              ...issueAcc,
              [`${issue.publicationcode} ${issue.issuenumber}`]: {
                min: issue.estimationMin,
                max: issue.estimationMax,
              },
            }),
            {} as { [issuecode: string]: InducksIssueQuotationSimple },
          ),
        );
      } else {
        console.error(data.error);
      }
    },
    fetchPublicationNamesFromCountry = async (countrycode: string) =>
      publicationNamesFullCountries.value.includes(countrycode)
        ? void 0
        : coaServices
            .getPublicationListFromCountrycodes([countrycode])
            .then((data) => {
              addPublicationNames({
                ...(publicationNames.value || {}),
                ...data,
              });
              publicationNamesFullCountries.value = [
                ...publicationNamesFullCountries.value,
                countrycode,
              ];
            }),
    fetchPersonNames = async (newPersonCodes: string[]) => {
      const actualNewPersonCodes = [
        ...new Set(
          newPersonCodes.filter(
            (personCode) =>
              !Object.keys(personNames.value || {}).includes(personCode),
          ),
        ),
      ];
      return (
        actualNewPersonCodes.length &&
        setPersonNames({
          ...(personNames.value || {}),
          ...(await coaServices.getAuthorList(actualNewPersonCodes)),
        })
      );
    },
    fetchIssueNumbersWithTitles = async (publicationcodes: string[]) => {
      Object.assign(
        issuesWithTitles.value,
        await coaServices.getIssuesWithTitles(
          publicationcodes.filter(
            (publicationcode) =>
              !Object.keys(issuesWithTitles.value).includes(publicationcode),
          ),
        ),
      );
    },
    fetchIssueNumbers = async function (publicationCodes: string[]) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationcode) =>
              !Object.keys(issueNumbers.value || {}).includes(publicationcode),
          ),
        ),
      ];
      if (newPublicationCodes.length) {
        const data =
          await coaServices.getIssuesByPublicationCodes(newPublicationCodes);
        if (data.error) {
          console.error(data);
        } else {
          addIssueNumbers(
            data.issues.reduce<typeof issueNumbers.value>(
              (acc, issue) => ({
                ...acc,
                [issue.publicationcode]: [
                  ...(acc[issue.publicationcode] || []),
                  issue.issuenumber,
                ],
              }),
              {},
            ),
          );

          addIssuecodes(
            data.issues.reduce<typeof issuecodes.value>(
              (acc, issue) => ({
                ...acc,
                [issue.publicationcode]: [
                  ...(acc[issue.publicationcode] || []),
                  issue.issuecode,
                ],
              }),
              {},
            ),
          );
        }
      }
    },
    fetchIssueCodesDetails = async (issueCodes: string[]) => {
      const newIssueCodes = [
        ...new Set(
          issueCodes.filter(
            (issueCode) =>
              !Object.keys(issueCodeDetails.value || {}).includes(issueCode),
          ),
        ),
      ];
      if (newIssueCodes.length) {
        addIssueCodeDetails(await coaServices.decompose(newIssueCodes));
      }
    },
    fetchRecentIssues = () => coaServices.getRecentIssues(),
    fetchCoverUrls = (publicationcode: string) =>
      coaServices.getIssueCoverDetailsByPublicationcode(publicationcode),
    fetchIssueUrls = async ({
      publicationcode,
      issuenumber,
    }: {
      publicationcode: string;
      issuenumber: string;
    }) => {
      const issueCode = `${publicationcode} ${issuenumber}`;
      if (!issueDetails.value[issueCode]) {
        const newIssueDetails = await coaServices.getIssueDetails(
          publicationcode,
          issuenumber,
        );

        Object.assign(issueDetails.value, {
          [issueCode]: addPartInfo(newIssueDetails),
        });
      }
    };
  return {
    addIssueCodeDetails,
    addIssueNumbers,
    addIssueQuotations,
    addPublicationNames,
    countryNames,
    coverUrls,
    fetchCountryNames,
    fetchCoverUrls,
    fetchIssueCodesDetails,
    fetchIssueNumbers,
    fetchIssueNumbersWithTitles,
    fetchIssueQuotations,
    fetchIssueUrls,
    fetchPersonNames,
    fetchPublicationNames,
    fetchPublicationNamesFromCountry,
    fetchRecentIssues,
    isLoadingCountryNames,
    issueCodeDetails,
    issueDetails,
    issueNumbers,
    issuecodes,
    issueQuotations,
    issuesWithTitles,
    personNames,
    publicationNames,
    publicationNamesFullCountries,
    setCoverUrl,
    setPersonNames,
  };
});
