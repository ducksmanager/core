import "dotenv/config";

import type { inducks_issuequotation_raw } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

export const createQuotations = async (
  data: Omit<
    inducks_issuequotation_raw,
    "id" | "publicationcode" | "issuenumber"
  >[],
) => {
  console.log(`Adding ${data.length} quotations`);
  return prismaCoa.inducks_issuequotation_raw.createMany({
    data: await prismaCoa.augmentIssueArrayWithInducksData(data),
  });
};

export const deleteQuotations = async (source: string) =>
  await prismaCoa.inducks_issuequotation_raw.deleteMany({
    where: {
      source,
    },
  });

export const isInducksIssuecodeExisting = async (issuecode: string) =>
  await prismaCoa.inducks_issue.findFirstOrThrow({
    where: {
      issuecode,
    },
  });
export const getIssuecode = async (
  publicationcode: string,
  issuenumber: string,
) =>
  prismaCoa.inducks_issue
    .findFirst({
      select: {
        issuecode: true,
      },
      where: {
        publicationcode,
        issuenumber,
      },
    })
    .then((result) => result?.issuecode);

export const getInducksIssuecodesBetween = async (
  issuecodeStart: string,
  issuecodeEnd: string,
) => {
  if (!issuecodeEnd) {
    issuecodeEnd = issuecodeStart;
  }
  const publicationcode = (
    await prismaCoa.inducks_issue.findFirstOrThrow({
      where: {
        issuecode: issuecodeStart,
      },
      select: {
        publicationcode: true,
      },
    })
  ).publicationcode;

  const coaIssues = (
    await prismaCoa.inducks_issue.findMany({
      where: { publicationcode },
      select: { issuecode: true },
    })
  ).map(({ issuecode }) => issuecode);

  if (!coaIssues.length) {
    console.warn(
      ` No issue found in COA for publication code ${publicationcode}`,
    );
    return [];
  }

  const startIssueIndex = coaIssues.findIndex(
    (issuecode) => issuecode === issuecodeStart,
  );
  if (startIssueIndex === -1) {
    console.warn(` No issue found in COA for issue code ${issuecodeStart}`);
    return [];
  }
  const endIssueIndex = coaIssues.findIndex(
    (issuecode) => issuecode === issuecodeEnd,
  );
  if (endIssueIndex === -1) {
    console.warn(` No issue found in COA for issue code ${issuecodeEnd}`);
    return [];
  }
  return coaIssues.filter(
    (_, index) => index >= startIssueIndex && index <= endIssueIndex,
  );
};

export const getAll = async () =>
  await prismaCoa.inducks_issuequotation_raw.findMany({
    orderBy: [
      {
        issuecode: "asc",
      },
    ],
  });
