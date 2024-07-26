import { getCurrentLocaleShortKey } from "~/composables/useLocales";
import type CoaServices from "~dm-services/coa/types";
import { InducksIssueDetails } from "~dm-types/InducksIssueDetails";
import { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { inducks_issue } from "~prisma-clients/client_coa";
import { EventReturnType } from "~socket.io-services/types";

import { dmSocketInjectionKey } from "../composables/useDmSocket";

const addPartInfo = (issueDetails: InducksIssueDetails) => {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce<{ [storycode: string]: number }>(
      (acc, { storycode }) => ({
        ...acc,
        [storycode]: !storycode ? 0 : (acc[storycode] || 0) + 1,
      }),
      {},
    ),
  )
    .filter(([, occurrences]) => occurrences > 1)
    .reduce<{ [storycode: string]: number }>(
      (acc, [storycode]) => ({
        ...acc,
        [storycode]: 1,
      }),
      {},
    );
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
    coverUrls = ref<{ [shortIssuenumber: string]: string }>({}),
    countryNames = shallowRef<EventReturnType<
      CoaServices["getCountryList"]
    > | null>(null),
    publicationNames = shallowRef<
      EventReturnType<CoaServices["getPublicationListFromCountrycodes"]>
    >({}),
    publicationNamesFullCountries = ref<string[]>([]),
    personNames = shallowRef<EventReturnType<
      CoaServices["getAuthorList"]
    > | null>(null),
    shortIssuenumbers = ref<{ [publicationcode: string]: string[] }>({}),
    shortIssuecodes = ref<{ [publicationcode: string]: string[] }>({}),
    issuesWithTitles = ref<EventReturnType<CoaServices["getIssuesWithTitles"]>>(
      {},
    ),
    issueDetails = ref<{ [shortIssuecode: string]: InducksIssueDetails }>({}),
    isLoadingCountryNames = ref(false),
    issueCodeDetails = ref<{ [shortIssuecode: string]: inducks_issue }>({}),
    issueQuotations = ref<{
      [shortIssuecode: string]: InducksIssueQuotationSimple;
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
        personNames.value,
      );
    },
    setCoverUrl = (shortIssuenumber: string, url: string) => {
      coverUrls.value[shortIssuenumber] = url;
    },
    addShortIssuenumbers = (newShortIssuenumbers: {
      [publicationcode: string]: string[];
    }) => {
      Object.assign(shortIssuenumbers.value, newShortIssuenumbers);
    },
    addShortIssuecodes = (newIssuecodes: {
      [publicationcode: string]: string[];
    }) => {
      Object.assign(shortIssuecodes.value, newIssuecodes);
    },
    addIssueCodeDetails = (newIssueCodeDetails: {
      [shortIssuecode: string]: inducks_issue;
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
      const results = await coaServices.getIssuesWithTitles(
        publicationcodes.filter(
          (publicationcode) =>
            !Object.keys(issuesWithTitles.value).includes(publicationcode),
        ),
      );
      Object.assign(issuesWithTitles.value, results);
    },
    fetchIssueNumbers = async function (publicationCodes: string[]) {
      const newPublicationCodes = [
        ...new Set(
          publicationCodes.filter(
            (publicationcode) =>
              !Object.keys(shortIssuenumbers.value || {}).includes(
                publicationcode,
              ),
          ),
        ),
      ];
      if (newPublicationCodes.length) {
        const data =
          await coaServices.getIssuesByPublicationCodes(newPublicationCodes);
        if (data.error) {
          console.error(data);
        } else {
          addShortIssuenumbers(
            data.issues.reduce<typeof shortIssuenumbers.value>(
              (acc, issue) => ({
                ...acc,
                [issue.publicationcode]: [
                  ...(acc[issue.publicationcode] || []),
                  issue.shortIssuenumber,
                ],
              }),
              {},
            ),
          );

          addShortIssuecodes(
            data.issues.reduce<typeof shortIssuecodes.value>(
              (acc, { publicationcode, shortIssuecode }) => ({
                ...acc,
                [publicationcode]: [
                  ...(acc[publicationcode] || []),
                  shortIssuecode,
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
    fetchCoverUrlsByShortIssuecodes = (issuecodes: string[]) =>
      coaServices.getIssueCoverDetails(issuecodes),
    fetchIssueUrls = async ({
      publicationcode,
      shortIssuenumber,
    }: {
      publicationcode: string;
      shortIssuenumber: string;
    }) => {
      const shortIssuecode = `${publicationcode} ${shortIssuenumber}`;
      if (!issueDetails.value[shortIssuecode]) {
        const newIssueDetails = await coaServices.getIssueDetails(
          publicationcode,
          shortIssuenumber,
        );

        Object.assign(issueDetails.value, {
          [shortIssuecode]: addPartInfo(newIssueDetails),
        });
      }
    };
  return {
    addIssueCodeDetails,
    addShortIssuenumbers,
    addIssueQuotations,
    addPublicationNames,
    countryNames,
    coverUrls,
    fetchCountryNames,
    fetchCoverUrls,
    fetchCoverUrlsByShortIssuecodes,
    fetchIssueCodesDetails,
    fetchIssueNumbers,
    fetchIssueNumbersWithTitles,
    fetchIssueUrls,
    fetchPersonNames,
    fetchPublicationNames,
    fetchPublicationNamesFromCountry,
    fetchRecentIssues,
    isLoadingCountryNames,
    issueCodeDetails,
    issueDetails,
    shortIssuenumbers,
    shortIssuecodes,
    issueQuotations,
    issuesWithTitles,
    personNames,
    publicationNames,
    publicationNamesFullCountries,
    setCoverUrl,
    setPersonNames,
  };
});
