import type { ShallowRef } from "vue";

import type { QuotedIssue } from "~dm-types/QuotedIssue";
import type { issue_condition } from "~prisma-schemas/schemas/dm";
import type { ClientEvents as CollectionServices } from "~dm-services/collection";
import { ON_SALE_LABEL_ID } from "~dm-types/Labels";

import { coa } from "../stores/coa";
import { EventOutput } from "socket-call-client";

export type ServiceIssues = EventOutput<CollectionServices, "getIssues">;

const countIssuesPerGroup = <K extends string>(
  groups: Record<K, ServiceIssues>,
  includeDuplicates = true,
) =>
  Object.fromEntries(
    Object.entries(groups as Record<string, ServiceIssues>).map(
      ([key, groupIssues]) => [
        key,
        includeDuplicates
          ? groupIssues.length
          : new Set(groupIssues.map(({ issuecode }) => issuecode)).size,
      ],
    ),
  ) as Record<K, number>;

export default (issues: ShallowRef<ServiceIssues | undefined>) => {
  const total = computed(() => issues.value?.length);

  const getTotalPerCountry = (includeDuplicates = true) =>
    issues.value &&
    countIssuesPerGroup(
      issues.value.groupBy(({ issuecode }) => issuecode.split("/")[0], "[]"),
      includeDuplicates,
    );

  const getTotalPerPublication = (includeDuplicates = true) =>
    issues.value
      ? countIssuesPerGroup(
          issues.value.groupBy("publicationcode", "[]"),
          includeDuplicates,
        )
      : null;

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

  const totalPerPublication = computed(() => getTotalPerPublication()),
    totalPerPublicationWithoutDuplicates = computed(() =>
      getTotalPerPublication(false),
    ),
    issuesByIssuecode = computed(() =>
      issues.value?.groupBy("issuecode", "[]"),
    ),
    duplicateIssues = computed(() => {
      const issues = issuesByIssuecode.value || {};
      return Object.keys(issues).reduce<{ [issuecode: string]: ServiceIssues }>(
        (acc, issuecode) => {
          if (issues[issuecode].length > 1) {
            acc[issuecode] = issues[issuecode];
          }
          return acc;
        },
        {},
      );
    }),
    issuesInOnSaleStack = computed(() =>
      issues.value?.filter(({ labelIds }) =>
        labelIds.includes(ON_SALE_LABEL_ID),
      ),
    ),
    totalUniqueIssues = computed(
      () =>
        (!issues.value?.length
          ? 0
          : issues.value.length -
            Object.values(duplicateIssues.value).reduce(
              (acc, duplicatedIssue) => acc + duplicatedIssue.length - 1,
              0,
            )) || 0,
    ),
    totalPerCountry = computed(() => getTotalPerCountry()),
    totalPerCountryWithoutDuplicates = computed(() =>
      getTotalPerCountry(false),
    ),
    numberPerCondition = computed(() =>
      countIssuesPerGroup(
        issues.value?.groupBy("condition", "[]") ??
          ({} as Record<issue_condition, ServiceIssues>),
      ),
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

      const CONDITION_TO_ESTIMATION_PCT = {
        bon: 1,
        moyen: 0.7,
        mauvais: 0.3,
        indefini: 0.7,
        "": 0.7,
      };
      return (
        issues.value
          ?.filter(({ issuecode }) => issuecode in issueQuotations)
          .map(({ issuecode, condition }) => ({
            issuecode,
            condition,
            estimation: coa().issueQuotations[issuecode],
          }))
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
            quotedIssues.value.reduce(
              (acc, { estimationGivenCondition }) =>
                acc + estimationGivenCondition,
              0,
            ) || 0,
          )
        : null,
    );

  return {
    duplicateIssues,
    issuesInOnSaleStack,
    issuesByIssuecode,
    mostPossessedPublication,
    numberPerCondition,
    quotedIssues,
    quotationSum,
    total,
    totalPerCountry,
    totalPerCountryWithoutDuplicates,
    totalPerPublication,
    totalPerPublicationWithoutDuplicates,
    totalUniqueIssues,
    findInCollection,
  };
};
