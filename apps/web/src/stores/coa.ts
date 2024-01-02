import { getCurrentLocaleShortKey } from "~/composables/useLocales";
import { InducksIssueDetails } from "~dm-types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { inducks_issue } from "~prisma-clients/client_coa";
import {
  NamespaceEndpoint as CoaNamespaceEndpoint,
  Services as CoaServices,
} from "~services/coa/types";
import { EventReturnType } from "~services/types";

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

const services = useSocket<CoaServices>(CoaNamespaceEndpoint);

export const coa = defineStore("coa", () => {
  const ISSUECODE_REGEX =
      /^(?<countrycode>[^/]+)\/(?<magazinecode>[^ ]+) (?<issuenumber>.+)/,
    locale = useI18n().locale,
    coverUrls = ref({} as { [issuenumber: string]: string }),
    countryNames = ref(
      null as EventReturnType<CoaServices["getCountryList"]> | null,
    ),
    publicationNames = ref(
      {} as EventReturnType<CoaServices["getPublicationListFromCountrycode"]>,
    ),
    publicationNamesFullCountries = ref([] as string[]),
    personNames = ref(
      null as EventReturnType<CoaServices["getAuthorList"]> | null,
    ),
    issueNumbers = ref({} as { [issuecode: string]: string[] }),
    issuesWithTitles = ref(
      {} as {
        [issuenumber: string]: EventReturnType<
          CoaServices["getIssuesWithTitles"]
        >;
      },
    ),
    issueDetails = ref({} as { [issuecode: string]: InducksIssueDetails }),
    isLoadingCountryNames = ref(false as boolean),
    issueCounts = ref(null as { [publicationcode: string]: number } | null),
    issueCodeDetails = ref(
      null as { [issuecode: string]: inducks_issue } | null,
    ),
    issueQuotations = ref(
      null as {
        [issuecode: string]: InducksIssueQuotationSimple;
      } | null,
    ),
    issueCountsPerCountry = computed(
      () =>
        issueCounts.value &&
        Object.entries(issueCounts.value).reduce<Record<string, number>>(
          (acc, [publicationcode, count]) => {
            const [countrycode] = publicationcode.split("/");
            return {
              ...acc,
              [countrycode]: (acc[countrycode] || 0) + count,
            };
          },
          {},
        ),
    ),
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
        countryNames.value = await services.getCountryList(
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
          await services.getPublicationListFromPublicationcodeList(
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
      return (
        actualNewPublicationCodes.length &&
        addIssueQuotations(
          await services
            .getQuotationsByPublicationCodes(actualNewPublicationCodes)
            .then((data) =>
              data.reduce(
                (issueAcc, issue) => ({
                  ...issueAcc,
                  [`${issue.publicationcode} ${issue.issuenumber}`]: {
                    min: issue.estimationMin,
                    max: issue.estimationMax,
                  },
                }),
                {} as { [issuecode: string]: InducksIssueQuotationSimple },
              ),
            ),
        )
      );
    },
    fetchPublicationNamesFromCountry = async (countrycode: string) =>
      publicationNamesFullCountries.value.includes(countrycode)
        ? void 0
        : services
            .getPublicationListFromCountrycode(countrycode)
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
          ...(await services.getAuthorList(actualNewPersonCodes)),
        })
      );
    },
    fetchIssueNumbersWithTitles = async (publicationcode: string) => {
      issuesWithTitles.value[publicationcode] =
        await services.getIssuesWithTitles(publicationcode);
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
        addIssueNumbers(
          (
            await services.getIssuesByPublicationCodes(newPublicationCodes)
          ).reduce(
            (acc, issue) => ({
              ...acc,
              [issue.publicationcode]: [
                ...(acc[issue.publicationcode] || []),
                issue.issuenumber,
              ],
            }),
            {} as typeof issueNumbers.value,
          ),
        );
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
      return (
        newIssueCodes.length &&
        addIssueCodeDetails(await services.decompose(newIssueCodes))
      );
    },
    fetchIssueCounts = async () => {
      if (!issueCounts.value)
        issueCounts.value = await services.getCountByPublicationcode();
    },
    fetchRecentIssues = async () => await services.getRecentIssues(),
    fetchIssueUrls = async ({
      publicationcode,
      issuenumber,
    }: {
      publicationcode: string;
      issuenumber: string;
    }) => {
      const issueCode = `${publicationcode} ${issuenumber}`;
      if (!issueDetails.value[issueCode]) {
        const newIssueDetails = await services.getIssueDetails(
          publicationcode,
          issuenumber,
        );

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
    issueCountsPerCountry,
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
    fetchRecentIssues,
    fetchIssueCodesDetails,
    fetchIssueCounts,
    fetchIssueUrls,

    ISSUECODE_REGEX,
  };
});
