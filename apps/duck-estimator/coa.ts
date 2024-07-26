import "dotenv/config";

import {
  inducks_issuequotation,
  PrismaClient as PrismaCoa,
} from "~prisma-clients/client_coa";

export const prismaCoa = new PrismaCoa();

const cachedCoaIssues: Record<string, string[]> = {};

export const createQuotations = async (
  data: Omit<inducks_issuequotation, "id" | "shortIssuecode">[]
) => {
  console.log(`Adding ${data.length} quotations`);
  return prismaCoa.inducks_issuequotation.createMany({
    data,
  });
};

export const truncateQuotations = async () =>
  await prismaCoa.$executeRawUnsafe(`TRUNCATE TABLE inducks_issuequotation`);

export const isInducksIssueExisting = async (
  publicationcode: string,
  issuenumber: string
) =>
  (await getInducksIssuesBetween(publicationcode, issuenumber, issuenumber))
    .length;

export const getInducksIssuesBetween = async (
  publicationcode: string,
  shortIssuenumberStart: string,
  shortIssuenumberEnd = shortIssuenumberStart
) => {
  cachedCoaIssues[publicationcode] =
    cachedCoaIssues[publicationcode] ||
    (
      await prismaCoa.inducks_issue.findMany({
        where: { publicationcode },
        select: { shortIssuenumber: true },
      })
    ).map(({ shortIssuenumber }) => shortIssuenumber);

  if (!cachedCoaIssues[publicationcode].length) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode}`
    );
    return [];
  }

  const startIssueIndex =
    cachedCoaIssues[publicationcode].indexOf(shortIssuenumberStart);
  if (startIssueIndex === -1) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode} and issue number ${shortIssuenumberStart}`
    );
    return [];
  }
  const endIssueIndex =
    cachedCoaIssues[publicationcode].indexOf(shortIssuenumberEnd);
  if (endIssueIndex === -1) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode} and issue number ${shortIssuenumberEnd}`
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
        publicationcode: "asc",
      },
      { issuenumber: "asc" },
    ],
  });
