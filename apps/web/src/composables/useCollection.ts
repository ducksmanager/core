import type { ShallowRef } from "vue";

import type { QuotedIssue } from "~dm-types/QuotedIssue";
import type { issue, issue_condition } from "~prisma-clients/schemas/dm";

import { coa } from "../stores/coa";

export default (issues: ShallowRef<issue[]>) => {
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

  const totalPerPublication = computed(
      () =>
        issues.value?.reduce<{ [publicationcode: string]: number }>(
          (acc, { publicationcode }) => ({
            ...acc,
            [publicationcode]: (acc[publicationcode] || 0) + 1,
          }),
          {},
        ) || null,
    ),
    issuesByIssuecode = computed(() =>
      issues.value?.reduce<{ [issuecode: string]: issue[] }>(
        (acc, issue) => ({
          ...acc,
          [issue.issuecode]: [...(acc[issue.issuecode] || []), issue],
        }),
        {},
      ),
    ),
    duplicateIssues = computed(
      (): {
        [issuecode: string]: issue[];
      } =>
        (issuesByIssuecode.value &&
          Object.keys(issuesByIssuecode.value).reduce(
            (acc, issuecode) =>
              issuesByIssuecode.value![issuecode].length > 1
                ? {
                    ...acc,
                    [issuecode]: issuesByIssuecode.value![issuecode],
                  }
                : acc,
            {},
          )) ||
        {},
    ),
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
        (acc, issue) => ({
          ...acc,
          [issue.publicationcode.split("/")[0]]:
            (acc[issue.publicationcode.split("/")[0]] || 0) + 1,
        }),
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
    quotedIssues = computed<QuotedIssue[] | null>(() => {
      const issueQuotations = coa().issueQuotations;
      if (issueQuotations === null) {
        return null;
      }
      const getEstimation = (issuecode: string) => {
        const estimationData = issueQuotations[issuecode];
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
      const CONDITION_TO_ESTIMATION_PCT = {
        bon: 1,
        moyen: 0.7,
        mauvais: 0.3,
        indefini: 0.7,
        "": 0.7,
      };
      return (
        issues.value
          ?.filter(({ issuecode }) => getEstimation(issuecode))
          .map(({ issuecode, condition }) => {
            const estimation = getEstimation(issuecode);
            return {
              ...estimation,
              issuecode,
              condition,
              estimationGivenCondition: parseFloat(
                (
                  CONDITION_TO_ESTIMATION_PCT[condition] * estimation.estimation
                ).toFixed(1),
              ),
            };
          }) || null
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

  return {
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
  };
};
