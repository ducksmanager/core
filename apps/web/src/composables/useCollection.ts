import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

export default (collection: Ref<IssueWithPublicationcode[] | null>) => {
  const total = computed(() => collection.value?.length);
  const mostPossessedPublication = computed(
    () =>
      totalPerPublication.value &&
      Object.keys(totalPerPublication.value).reduce(
        (acc, publicationcode) =>
          acc &&
          totalPerPublication.value![acc] >
            totalPerPublication.value![publicationcode]
            ? acc
            : publicationcode,
        null as string | null,
      ),
  );

  const totalPerPublication = computed(
      () =>
        collection.value?.reduce(
          (acc, issue) => {
            const publicationcode = `${issue.country}/${issue.magazine}`;
            return {
              ...acc,
              [publicationcode]: (acc[publicationcode] || 0) + 1,
            };
          },
          {} as { [publicationcode: string]: number },
        ) || null,
    ),
    issuesByIssueCode = computed(
      () =>
        collection.value?.reduce(
          (acc, issue) => {
            const issuecode = `${issue.publicationcode} ${issue.issuenumber}`;
            return {
              ...acc,
              [issuecode]: [...(acc[issuecode] || []), issue],
            };
          },
          {} as { [issuecode: string]: IssueWithPublicationcode[] },
        ),
    ),
    duplicateIssues = computed(
      (): {
        [issuecode: string]: IssueWithPublicationcode[];
      } =>
        (issuesByIssueCode.value &&
          Object.keys(issuesByIssueCode.value).reduce(
            (acc, issuecode) =>
              issuesByIssueCode.value![issuecode].length > 1
                ? {
                    ...acc,
                    [issuecode]: issuesByIssueCode.value![issuecode],
                  }
                : acc,
            {},
          )) ||
        {},
    ),
    issuesInToReadStack = computed(
      () => collection.value?.filter(({ isToRead }) => isToRead),
    ),
    issuesInOnSaleStack = computed(
      () => collection.value?.filter(({ isOnSale }) => isOnSale),
    ),
    totalUniqueIssues = computed(
      () =>
        (duplicateIssues.value &&
          (!collection.value?.length
            ? 0
            : collection.value?.length -
              Object.values(duplicateIssues.value).reduce(
                (acc, duplicatedIssue) => acc + duplicatedIssue.length - 1,
                0,
              ))) ||
        0,
    ),
    totalPerCountry = computed(
      () =>
        collection.value?.reduce(
          (acc, issue) => ({
            ...acc,
            [issue.country]: (acc[issue.country] || 0) + 1,
          }),
          {} as { [countrycode: string]: number },
        ),
    ),
    numberPerCondition = computed(
      () =>
        collection.value?.reduce(
          (acc, { condition }) => ({
            ...acc,
            [condition || "indefini"]: (acc[condition || "indefini"] || 0) + 1,
          }),
          {} as { [condition: string]: number },
        ) || {},
    );

  return {
    duplicateIssues,
    issuesInOnSaleStack,
    issuesInToReadStack,
    issuesByIssueCode,
    mostPossessedPublication,
    numberPerCondition,
    total,
    totalPerCountry,
    totalPerPublication,
    totalUniqueIssues,
  };
};
