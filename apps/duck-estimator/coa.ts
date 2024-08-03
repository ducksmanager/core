import "dotenv/config";

import type { inducks_issue, inducks_issuequotation,
} from "~prisma-clients/schemas/coa";
import {  prismaClient as prismaCoa,
} from "~prisma-clients/schemas/coa/client";

const cachedCoaIssues: Record<string, Pick<inducks_issue, 'issuecode'|'issuenumber'>[]> = {};

export const createQuotations = async (
  data: Omit<inducks_issuequotation, "id" | "shortIssuecode"|"publicationcode"|"issuenumber">[]
) => {
  console.log(`Adding ${data.length} quotations`);
  return prismaCoa.inducks_issuequotation.createMany({
    data,
  });
};

export const truncateQuotations = async () =>
  await prismaCoa.$executeRawUnsafe(`TRUNCATE TABLE inducks_issuequotation`);

export const isInducksIssuecodeExisting = async (
  issuecode: string
) =>
  await prismaCoa.inducks_issue.findFirstOrThrow({
    where: {
      issuecode
    }
  });
export const getIssuecode = async (
  publicationcode: string,
  issuenumber: string
) =>
  (await getInducksIssuesBetween(publicationcode, issuenumber, issuenumber))[0];

export const getInducksIssuesBetween = async (
  publicationcode: string,
  issuenumberStart: string,
  issuenumberEnd = issuenumberStart
) => {
  cachedCoaIssues[publicationcode] =
    cachedCoaIssues[publicationcode] ||
    (
      await prismaCoa.inducks_issue.findMany({
        where: { publicationcode },
        select: { issuenumber: true, issuecode: true},
      })
    ).map(({ issuenumber }) => issuenumber);

  if (!cachedCoaIssues[publicationcode].length) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode}`
    );
    return [];
  }

  const startIssueIndex =
    cachedCoaIssues[publicationcode].findIndex(({ issuenumber }) => issuenumber === issuenumberStart);
  if (startIssueIndex === -1) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode} and issue number ${issuenumberStart}`
    );
    return [];
  }
  const endIssueIndex =
  cachedCoaIssues[publicationcode].findIndex(({ issuenumber }) => issuenumber === issuenumberEnd);
  if (endIssueIndex === -1) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode} and issue number ${issuenumberEnd}`
    );
    return [];
  }
  return cachedCoaIssues[publicationcode].filter(
    (_, index) => index >= startIssueIndex && index <= endIssueIndex
  );
};

export const getAll = async () =>
  await prismaCoa.inducks_issuequotation.findMany({
    orderBy: [
      {
        issuecode: "asc" },
    ],
  });
