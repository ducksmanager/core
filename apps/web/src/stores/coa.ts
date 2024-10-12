import { getCurrentLocaleShortKey } from "~/composables/useLocales";
import type services from "~dm-services/coa/types";
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
    coa: { services },
  } = inject(socketInjectionKey)!;

  const locale = useI18n().locale,
    coverUrls = shallowRef<{ [issuecode: string]: string }>({}),
    countryNames = shallowRef<EventReturnType<
      services["getCountryList"]
    > | null>(null),
    publicationNames = shallowRef<
      EventReturnType<services["getPublicationListFromCountrycodes"]>
    >({}),
    publicationNamesFullCountries = shallowRef<string[]>([]),
    personNames = shallowRef<EventReturnType<services["getAuthorList"]> | null>(
      null,
    ),
    issuecodes = ref<string[]>([]),
    issueDetails = shallowRef<{ [issuecode: string]: InducksIssueDetails }>({}),
    isLoadingCountryNames = ref(false),
    issuecodeDetails = shallowRef<
      Exclude<EventReturnType<services["getIssues"]>, "error">
    >({}),
    issuePopularities = shallowRef<
      EventReturnType<services["getIssuePopularities"]>
    >({}),
    issuecodesByPublicationcode = ref<{
      [publicationcode: string]: string[];
    }>({}),
    issueQuotations = ref<
      EventReturnType<services["getQuotationsByIssuecodes"]>["quotations"]
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
      if (!personNames.value) {
        personNames.value = {};
      }
      personNames.value = Object.assign(personNames.value, newPersonNames);
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
          (await services.getQuotationsByIssuecodes(newIssuecodes)).quotations,
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
    fetchPublicationNamesFromCountry = async (countrycode: string) =>
      publicationNamesFullCountries.value.includes(countrycode)
        ? void 0
        : services
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
          ...(await services.getAuthorList(actualNewPersonCodes)),
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
          await services.getIssues(newIssuecodes, withTitles),
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
          await services.getIssuePopularities(newIssuecodes),
        );
      }
    },
    fetchIssuecodesByPublicationcode = async (publicationcodes: string[]) => {
      const existingPublicationcodes = new Set(
        Object.keys(issuecodesByPublicationcode.value || {}),
      );
      const newPublicationcodes = publicationcodes.filter(
        (publicationcode) => !existingPublicationcodes.has(publicationcode),
      );

      if (newPublicationcodes.length) {
        const issuesByPublicationcode =
          await services.getIssuesByPublicationcodes(newPublicationcodes);

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
    fetchRecentIssues = () => services.getRecentIssues(),
    fetchCoverUrls = (publicationcode: string) =>
      services.getIssueCoverDetailsByPublicationcode(publicationcode),
    fetchCoverUrlsByIssuecodes = (issuecodes: string[]) =>
      services.getIssueCoverDetails(issuecodes),
    fetchIssueUrls = async ({ issuecode }: { issuecode: string }) => {
      if (!issueDetails.value[issuecode]) {
        const newIssueDetails = await services.getIssueDetails(issuecode);

        Object.assign(issueDetails.value, {
          [issuecode]: addPartInfo(newIssueDetails),
        });
      }
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
    services,
    setCoverUrl,
    setPersonNames,
  };
});
