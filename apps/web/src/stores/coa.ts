import { getCurrentLocaleShortKey } from "~/composables/useLocales";
import type CoaServices from "~dm-services/coa/types";
import type { InducksIssueDetails } from "~dm-types/InducksIssueDetails";
import type { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { EventReturnType } from "~socket.io-services/types";

import { socketInjectionKey } from "../composables/useDmSocket";

const addPartInfo = (issueDetails: InducksIssueDetails) => {
  const storyPartCounter = Object.entries(
    issueDetails.entries.reduce<{ [storycode: string]: number }>(
      (acc, { storycode }) => {
        if (storycode) {
          acc[storycode] = (acc[storycode] || 0) + 1;
        }
        return acc;
      },
      {},
    ),
  )
    .filter(([, occurrences]) => occurrences > 1)
    .reduce<{ [storycode: string]: number }>((acc, [storycode]) => {
      acc[storycode] = 1;
      return acc;
    }, {});

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
  } = inject(socketInjectionKey)!;

  const locale = useI18n().locale,
    coverUrls = shallowRef<{ [issuecode: string]: string }>({}),
    countryNames = shallowRef<EventReturnType<
      CoaServices["getCountryList"]
    > | null>(null),
    publicationNames = shallowRef<
      EventReturnType<CoaServices["getPublicationListFromCountrycodes"]>
    >({}),
    publicationNamesFullCountries = shallowRef<string[]>([]),
    personNames = shallowRef<EventReturnType<
      CoaServices["getAuthorList"]
    > | null>(null),
    issuecodes = ref<string[]>([]),
    issueDetails = shallowRef<{ [issuecode: string]: InducksIssueDetails }>({}),
    isLoadingCountryNames = ref(false),
    issuecodeDetails = shallowRef<
      Exclude<EventReturnType<CoaServices["getIssues"]>, "error">
    >({}),
    issuePopularities = shallowRef<
      EventReturnType<CoaServices["getIssuePopularities"]>
    >({}),
    issuecodesByPublicationcode = ref<{
      [publicationcode: string]: string[];
    }>({}),
    issueQuotations = shallowRef<
      EventReturnType<CoaServices["getQuotationsByIssuecodes"]>["quotations"]
    >({}),
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
    setCoverUrl = (issuecode: string, url: string) => {
      coverUrls.value[issuecode] = url;
    },
    fetchIssueQuotations = async (issuecodes: string[]) => {
      const existingIssuecodes = new Set(
        Object.keys(issueQuotations.value || {}),
      );
      const newIssuecodes = issuecodes.filter(
        (issuecode) => !existingIssuecodes.has(issuecode),
      );
      if (newIssuecodes.length) {
        Object.assign(
          issueQuotations.value,
          (await coaServices.getQuotationsByIssuecodes(newIssuecodes))
            .quotations,
        );
      }
    },
    addIssueQuotations = (
      newIssueQuotations: Record<string, InducksIssueQuotationSimple>,
    ) => {
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
    fetchIssuecodeDetails = async (
      issuecodes: string[],
      withTitles: boolean = false,
    ) => {
      const newIssuecodes = issuecodes.filter((issuecode) =>
        withTitles
          ? !("title" in (issuecodeDetails.value[issuecode] || {}))
          : !issuecodeDetails.value[issuecode],
      );
      if (newIssuecodes.length) {
        Object.assign(
          issuecodeDetails.value,
          await coaServices.getIssues(newIssuecodes, withTitles),
        );
      }
    },
    fetchIssuePopularities = async (issuecodes: string[]) => {
      const existingIssuecodes = new Set(
        Object.keys(issuePopularities.value || {}),
      );
      const newIssuecodes = issuecodes.filter(
        (issuecode) => !existingIssuecodes.has(issuecode),
      );
      if (newIssuecodes.length) {
        Object.assign(
          issuePopularities.value,
          await coaServices.getIssuePopularities(newIssuecodes),
        );
      }
    },
    fetchIssuecodesByPublicationcode = async (publicationcodes: string[]) => {
      debugger;
      const existingPublicationcodes = new Set(
        Object.keys(issuecodesByPublicationcode.value || {}),
      );
      const newPublicationcodes = publicationcodes.filter(
        (publicationcode) => !existingPublicationcodes.has(publicationcode),
      );

      if (newPublicationcodes.length) {
        const issuesByPublicationcode =
          await coaServices.getIssuesByPublicationcodes(newPublicationcodes);

        Object.assign(
          issuecodeDetails.value,
          Object.values(issuesByPublicationcode).flat().groupBy("issuecode"),
        );
        Object.assign(
          issuecodesByPublicationcode.value,
          Object.entries(issuesByPublicationcode).reduce<
            typeof issuecodesByPublicationcode.value
          >((acc, [publicationcode, issues]) => {
            acc[publicationcode] = issues.map(({ issuecode }) => issuecode);
            return acc;
          }, {}),
        );
      }
    },
    fetchRecentIssues = () => coaServices.getRecentIssues(),
    fetchCoverUrls = (publicationcode: string) =>
      coaServices.getIssueCoverDetailsByPublicationcode(publicationcode),
    fetchCoverUrlsByIssuecodes = (issuecodes: string[]) =>
      coaServices.getIssueCoverDetails(issuecodes),
    fetchIssueUrls = async ({ issuecode }: { issuecode: string }) => {
      if (!issueDetails.value[issuecode]) {
        const newIssueDetails = await coaServices.getIssueDetails(issuecode);

        Object.assign(issueDetails.value, {
          [issuecode]: addPartInfo(newIssueDetails),
        });
      }
    },
    getEstimationWithAverage = (issuecode: string) => {
      const estimationData = issueQuotations.value[issuecode];
      return (
        estimationData && {
          ...estimationData,
          estimation:
            (estimationData.estimationMax
              ? ((estimationData.estimationMin || 0) +
                  estimationData.estimationMax!) /
                2
              : estimationData.estimationMin) || 0,
        }
      );
    };
  return {
    addIssueQuotations,
    addPublicationNames,
    countryNames,
    coverUrls,
    fetchCountryNames,
    fetchCoverUrls,
    fetchCoverUrlsByIssuecodes,
    fetchIssuecodeDetails,
    fetchIssuecodesByPublicationcode,
    fetchIssuePopularities,
    fetchIssueQuotations,
    fetchIssueUrls,
    fetchPersonNames,
    fetchPublicationNames,
    fetchPublicationNamesFromCountry,
    fetchRecentIssues,

    getEstimationWithAverage,
    isLoadingCountryNames,
    issuecodeDetails,
    issuecodesByPublicationcode,
    issueDetails,
    issuePopularities: issuePopularities,
    issuecodes,
    issueQuotations,
    personNames,
    publicationNames,
    publicationNamesFullCountries,
    setCoverUrl,
    setPersonNames,
  };
});
