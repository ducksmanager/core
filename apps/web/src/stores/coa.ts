import type { EventOutput, SuccessfulEventOutput } from "socket-call-client";

import usePartialQueryCache from "../composables/usePartialCache";

import type { ClientEvents as CoaClientEvents } from "~dm-services/coa";
import type { InducksIssueDetails } from "~dm-types/InducksIssueDetails";
import type {
  ExtraSelectField,
  IssuecodeDetail,
} from "~prisma-schemas/schemas/coa";

import { socketInjectionKey } from "../composables/useDmSocket";
import { getCurrentLocaleShortKey } from "../composables/useLocales";

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
  const locale = useI18n().locale;

  const coaCachedEvents = usePartialQueryCache(
    "coa",
    events as CoaClientEvents,
    locale,
  );

  const {
    ref: publicationNames,
    fetch: fetchPublicationNames,
    add: addPublicationNames,
  } = coaCachedEvents.query("getPublicationListFromPublicationcodeList");

  const {
    ref: personNames,
    fetch: fetchPersonNames,
    add: setPersonNames,
  } = coaCachedEvents.query("getAuthorList");

  const { ref: issuePopularities, fetch: fetchIssuePopularities } =
    coaCachedEvents.query("getIssuePopularities");

  const {
    ref: issueQuotations,
    fetch: fetchIssueQuotations,
    add: addIssueQuotations,
  } = coaCachedEvents.query("getQuotationsByIssuecodes", "quotations");

  const {
    ref: issuecodesByPublicationcode,
    fetch: fetchIssuecodesByPublicationcode,
  } = coaCachedEvents.query("getIssuecodesByPublicationcodes");

  const { ref: storyDetails, fetch: fetchStoryDetails } =
    coaCachedEvents.query("getStoryDetails");

  const { ref: storyversionDetails, fetch: fetchStoryversionDetails } =
    coaCachedEvents.query("getStoryversionsDetails");

  const {
    ref: issueCountsByCountrycode,
    fetch: fetchIssueCountsByCountrycode,
  } = coaCachedEvents.query("getCoaCountByCountrycode");

  const coverUrls = shallowRef<{ [issuecode: string]: string }>({}),
    countryNames = shallowRef<EventOutput<CoaClientEvents, "getCountryList">>(),
    publicationNamesFullCountries = shallowRef<string[]>([]),
    issueDetails = ref<{ [issuecode: string]: InducksIssueDetails }>({}),
    isLoadingCountryNames = ref(false),
    issuecodeDetails = shallowRef<Record<string, IssuecodeDetail>>({}),
    issuesByPublicationcode = ref<
      Record<string, EventOutput<CoaClientEvents, "getIssuesByPublicationcode">>
    >({}),
    issueCountsByPublicationcode = ref<
      EventOutput<CoaClientEvents, "getCoaCountByPublicationcode">
    >({}),
    storyUrls = ref<
      SuccessfulEventOutput<CoaClientEvents, "getStoryDetails">["storyUrls"]
    >({}),
    setCoverUrl = (issuecode: string, url: string) => {
      coverUrls.value[issuecode] = url;
    },
    fetchCountryNames = async (ignoreCache = false) => {
      if (
        (!isLoadingCountryNames.value && !countryNames.value) ||
        ignoreCache
      ) {
        isLoadingCountryNames.value = true;
        countryNames.value = await events.getCountryList(
          getCurrentLocaleShortKey(locale.value),
          [],
        );
        isLoadingCountryNames.value = false;
      }
    },
    fetchPublicationNamesFromCountry = async (countrycode: string) =>
      publicationNamesFullCountries.value.includes(countrycode)
        ? void 0
        : events
            .getPublicationListFromCountrycodes([countrycode])
            .then((data) => {
              addPublicationNames(data);
              publicationNamesFullCountries.value = [
                ...publicationNamesFullCountries.value,
                countrycode,
              ];
            }),
    fetchIssuecodeDetails = async (
      issuecodes: string[],
      withFields: ExtraSelectField[] = [],
    ) => {
      const newIssuecodes = issuecodes.filter(
        (issuecode) =>
          !(issuecode in issuecodeDetails.value) ||
          withFields.some(
            (field) => !(field in issuecodeDetails.value[issuecode]),
          ),
      );
      if (newIssuecodes.length) {
        Object.assign(
          issuecodeDetails.value,
          await events.getIssues(newIssuecodes, withFields),
        );
      }
    },
    fetchIssuesByPublicationcode = async (publicationcode: string) => {
      if (!(publicationcode in issuesByPublicationcode.value)) {
        issuesByPublicationcode.value[publicationcode] =
          await events.getIssuesByPublicationcode(publicationcode);
      }
    },
    fetchIssueCountsByPublicationcode = async (publicationcodes: string[]) => {
      Object.assign(
        issueCountsByPublicationcode.value,
        await events.getCoaCountByPublicationcode(
          publicationcodes.filter(
            (publicationcode) =>
              !(publicationcode in issueCountsByPublicationcode.value),
          ),
        ),
      );
    },
    fetchRecentIssues = () => events.getRecentIssues(),
    fetchCoverUrls = (publicationcode: string) =>
      events.getIssueCoverDetailsByPublicationcode(publicationcode),
    fetchCoverUrlsByIssuecodes = (issuecodes: string[]) =>
      events.getIssueCoverDetails(issuecodes),
    fetchIssueUrls = async (issuecode: string) => {
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
    fetchIssueCountsByCountrycode,
    fetchIssueCountsByPublicationcode,
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
    issueCountsByCountrycode,
    issueCountsByPublicationcode,
    issueDetails,
    issuePopularities,
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
