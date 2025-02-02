import type { EventOutput, SuccessfulEventOutput } from "socket-call-client";

import { getCurrentLocaleShortKey } from "~/composables/useLocales";
import type { ClientEvents as CoaClientEvents } from "~dm-services/coa";
import type { InducksIssueDetails } from "~dm-types/InducksIssueDetails";
import type { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type {
  inducks_story,
  inducks_storyversion,
} from "~prisma-schemas/client_coa";

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
  const { coa: events } = inject(socketInjectionKey)!;

  const locale = useI18n().locale,
    coverUrls = shallowRef<{ [issuecode: string]: string }>({}),
    countryNames = shallowRef<EventOutput<CoaClientEvents, "getCountryList">>(),
    publicationNames = shallowRef<
      EventOutput<CoaClientEvents, "getPublicationListFromCountrycodes">
    >({}),
    publicationNamesFullCountries = shallowRef<string[]>([]),
    personNames = shallowRef<EventOutput<CoaClientEvents, "getAuthorList">>(),
    issuecodes = ref<string[]>([]),
    issueDetails = shallowRef<{ [issuecode: string]: InducksIssueDetails }>({}),
    isLoadingCountryNames = ref(false),
    issuecodeDetails = shallowRef<EventOutput<CoaClientEvents, "getIssues">>(
      {},
    ),
    issuePopularities = shallowRef<
      EventOutput<CoaClientEvents, "getIssuePopularities">
    >({}),
    issuecodesByPublicationcode = ref<
      EventOutput<CoaClientEvents, "getIssuecodesByPublicationcodes">
    >({}),
    issuesByPublicationcode = ref<
      Record<string, EventOutput<CoaClientEvents, "getIssuesByPublicationcode">>
    >({}),
    issueQuotations = ref<
      SuccessfulEventOutput<
        CoaClientEvents,
        "getQuotationsByIssuecodes"
      >["quotations"]
    >({}),
    storyDetails = ref<Record<string, inducks_story>>({}),
    storyUrls = ref<
      SuccessfulEventOutput<CoaClientEvents, "getStoryDetails">["storyUrls"]
    >({}),
    storyversionDetails = ref<Record<string, inducks_storyversion>>({}),
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
        const newIssueQuotations =
          await events.getQuotationsByIssuecodes(newIssuecodes);
        if (!("error" in newIssueQuotations)) {
          addIssueQuotations(newIssueQuotations.quotations);
        }
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
        countryNames.value = await events.getCountryList(
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
          await events.getPublicationListFromPublicationcodeList(
            actualNewPublicationCodes,
          ),
        )
      );
    },
    fetchPublicationNamesFromCountry = async (countrycode: string) =>
      publicationNamesFullCountries.value.includes(countrycode)
        ? void 0
        : events
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
          ...(await events.getAuthorList(actualNewPersonCodes)),
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
          await events.getIssues(newIssuecodes, withTitles),
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
          await events.getIssuePopularities(newIssuecodes),
        );
      }
    },
    fetchStoryDetails = async (storycodes: string[]) => {
      const existingStorycodes = new Set(Object.keys(storyDetails.value || {}));
      const newStorycodes = storycodes.filter(
        (storycode) => !existingStorycodes.has(storycode),
      );
      if (newStorycodes.length) {
        const newStoryDetails = await events.getStoryDetails(newStorycodes);
        if (!("error" in newStoryDetails)) {
          Object.assign(storyDetails.value, newStoryDetails.stories);
          Object.assign(storyUrls.value, newStoryDetails.storyUrls);
        }
      }
    },
    fetchStoryversionDetails = async (storyversioncodes: string[]) => {
      const existingStoryversioncodes = new Set(
        Object.keys(storyversionDetails.value || {}),
      );
      const newStoryversioncodes = storyversioncodes.filter(
        (storyversion) => !existingStoryversioncodes.has(storyversion),
      );
      if (newStoryversioncodes.length) {
        const newStoryversionDetails =
          await events.getStoryversionsDetails(newStoryversioncodes);
        if (!("error" in newStoryversionDetails)) {
          Object.assign(
            storyversionDetails.value,
            newStoryversionDetails.storyversions,
          );
        }
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
        Object.assign(
          issuecodesByPublicationcode.value,
          await events.getIssuecodesByPublicationcodes(newPublicationcodes),
        );
      }
    },
    fetchIssuesByPublicationcode = async (publicationcode: string) => {
      if (!(publicationcode in issuesByPublicationcode.value)) {
        issuesByPublicationcode.value[publicationcode] =
          await events.getIssuesByPublicationcode(publicationcode);
      }
    },
    fetchRecentIssues = () => events.getRecentIssues(),
    fetchCoverUrls = (publicationcode: string) =>
      events.getIssueCoverDetailsByPublicationcode(publicationcode),
    fetchCoverUrlsByIssuecodes = (issuecodes: string[]) =>
      events.getIssueCoverDetails(issuecodes),
    fetchIssueUrls = async ({ issuecode }: { issuecode: string }) => {
      if (!issueDetails.value[issuecode]) {
        const newIssueDetails = await events.getIssueDetails(issuecode);

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
    events,
    fetchCountryNames,
    fetchCoverUrls,
    fetchCoverUrlsByIssuecodes,
    fetchIssuecodeDetails,
    fetchIssuecodesByPublicationcode,
    fetchIssuesByPublicationcode,
    fetchIssuePopularities,
    fetchIssueQuotations,
    fetchIssueUrls,
    fetchPersonNames,
    fetchPublicationNames,
    fetchPublicationNamesFromCountry,
    fetchRecentIssues,
    fetchStoryDetails,
    fetchStoryversionDetails,

    isLoadingCountryNames,
    issuecodeDetails,
    issuecodesByPublicationcode,
    issueDetails,
    issuePopularities: issuePopularities,
    issuecodes,
    issueQuotations,
    issuesByPublicationcode,
    personNames,
    publicationNames,
    publicationNamesFullCountries,
    setCoverUrl,
    setPersonNames,
    storyDetails,
    storyUrls,
    storyversionDetails,
  };
});
