import type { EventOutput } from "socket-call-client";
import type { ShallowRef } from "vue";

import type { ClientEvents as CollectionServices } from "~dm-services/collection";
import type { QuotedIssue } from "~dm-types/QuotedIssue";
import type { issue, issue_condition } from "~prisma-schemas/schemas/dm";

import { coa } from "../stores/coa";
import { socketInjectionKey } from "./useDmSocket";

export default (
  issues: ShallowRef<(issue & { issuecode: string })[] | undefined>,
) => {
  const isLoadingCollection = ref(false);

  const coaIssueCountsPerCountrycode =
      shallowRef<
        EventOutput<CollectionServices, "getIssues">["countByCountrycode"]
      >(),
    coaIssueCountsByPublicationcode =
      shallowRef<
        EventOutput<CollectionServices, "getIssues">["countByPublicationcode"]
      >();

  const total = computed(() => issues.value?.length);
  const mostPossessedPublication = computed(
    () =>
      totalPerPublication.value &&
      Object.keys(totalPerPublication.value).reduce<string | null>(
        (acc, publicationcode) =>
          acc &&
          totalPerPublication.value![acc] >
            totalPerPublication.value![publicationcode]
            ? acc
            : publicationcode,
        null,
      ),
  );

  const totalPerPublication = computed(() =>
      issues.value
        ? Object.fromEntries(
            Object.entries(issues.value?.groupBy("publicationcode", "[]")).map(
              ([publicationcode, issues]) => [publicationcode, issues.length],
            ),
          )
        : null,
    ),
    issuesByIssuecode = computed(() =>
      issues.value?.groupBy("issuecode", "[]"),
    ),
    duplicateIssues = computed(() => {
      const issues = issuesByIssuecode.value || {};
      return Object.keys(issues).reduce<{ [issuecode: string]: issue[] }>(
        (acc, issuecode) => {
          if (issues[issuecode].length > 1) {
            acc[issuecode] = issues[issuecode];
          }
          return acc;
        },
        {},
      );
    }),
    issuesInToReadStack = computed(() =>
      issues.value?.filter(({ isToRead }) => isToRead),
    ),
    issuesInOnSaleStack = computed(() =>
      issues.value?.filter(({ isOnSale }) => isOnSale),
    ),
    totalUniqueIssues = computed(
      () =>
        (duplicateIssues.value &&
          (!issues.value?.length
            ? 0
            : issues.value?.length -
              Object.values(duplicateIssues.value).reduce(
                (acc, duplicatedIssue) => acc + duplicatedIssue.length - 1,
                0,
              ))) ||
        0,
    ),
    totalPerCountry = computed(() =>
      issues.value?.reduce<{ [countrycode: string]: number }>(
        (acc, { publicationcode }) => {
          const countrycode = publicationcode.split("/")[0];
          acc[countrycode] = (acc[countrycode] || 0) + 1;
          return acc;
        },
        {},
      ),
    ),
    numberPerCondition = computed(
      () =>
        issues.value?.reduce(
          (acc, { condition }) => ({
            ...acc,
            [condition || "indefini"]: (acc[condition || "indefini"] || 0) + 1,
          }),
          {} as Record<issue_condition, number>,
        ) || ({} as Record<issue_condition, number>),
    ),
    findInCollection = (issuecode: string) =>
      issues.value?.find(
        ({ issuecode: collectionIssuecode }) =>
          collectionIssuecode === issuecode,
      ),
    quotedIssues = computed<
      (QuotedIssue & { estimationAverage: number })[] | null
    >(() => {
      const issueQuotations = coa().issueQuotations;
      if (issueQuotations === null) {
        return null;
      }
      const CONDITION_TO_ESTIMATION_PCT = {
        bon: 1,
        moyen: 0.7,
        mauvais: 0.3,
        indefini: 0.7,
        "": 0.7,
      };
      return (
        issues.value
          ?.map(({ issuecode, condition }) => ({
            issuecode,
            condition,
            estimation: coa().issueQuotations[issuecode],
          }))
          .filter(({ estimation }) => estimation)
          .map(({ condition, estimation }) => ({
            condition,
            ...estimation,
            estimationGivenCondition: parseFloat(
              (
                CONDITION_TO_ESTIMATION_PCT[condition] *
                estimation.estimationAverage
              ).toFixed(1),
            ),
          })) || null
      );
    }),
    quotationSum = computed(() =>
      quotedIssues.value
        ? Math.round(
            quotedIssues.value?.reduce(
              (acc, { estimationGivenCondition }) =>
                acc + estimationGivenCondition,
              0,
            ) || 0,
          )
        : null,
    );

  const loadCollection = async (
    username: string | null = null,
    afterUpdate = false,
  ) => {
    if (afterUpdate || (!isLoadingCollection.value && !issues.value)) {
      isLoadingCollection.value = true;
      const socket = injectLocal(socketInjectionKey)!;
      const results = username
        ? await socket.publicCollection.getPublicCollection(username)
        : await socket.collection.getIssues();
      if ("error" in results) {
        console.error(results.error);
      } else {
        let publicationNames: Record<string, string> = {};
        ({
          issues: issues.value,
          countByCountrycode: coaIssueCountsPerCountrycode.value,
          countByPublicationcode: coaIssueCountsByPublicationcode.value,
          publicationNames,
        } = results);
        coa().addPublicationNames(publicationNames);
        Object.assign(
          coa().issuecodeDetails,
          issues.value
            .map(({ issuecode, publicationcode, issuenumber }) => ({
              issuecode,
              publicationcode,
              issuenumber,
            }))
            .groupBy("issuecode"),
        );
      }

      Object.assign(
        coa().issuecodeDetails,
        issues
          .value!.map(({ issuecode, publicationcode, issuenumber }) => ({
            issuecode,
            publicationcode,
            issuenumber,
          }))
          .groupBy("issuecode"),
      );
    }
    isLoadingCollection.value = false;
  };

  return {
    coaIssueCountsPerCountrycode,
    coaIssueCountsByPublicationcode,
    duplicateIssues,
    issuesInOnSaleStack,
    issuesInToReadStack,
    issuesByIssuecode,
    mostPossessedPublication,
    numberPerCondition,
    quotedIssues,
    quotationSum,
    total,
    totalPerCountry,
    totalPerPublication,
    totalUniqueIssues,
    findInCollection,
    loadCollection,
  };
};
