import { Handler } from "express";

import {
  Prisma as PrismaCoa,
  PrismaClient as PrismaClientCoa,
} from "../../../../prisma/generated/client_coa";
import {
  cover,
  PrismaClient as PrismaClientCoverInfo,
} from "../../../../prisma/generated/client_cover_info";
import { PrismaClient as PrismaClientDm } from "../../../../prisma/generated/client_dm";

const prismaCoa = new PrismaClientCoa();
const prismaCoverInfo = new PrismaClientCoverInfo();
const prismaDm = new PrismaClientDm();

const getIssueQuotations = async (issueCodes: string[]) =>
  prismaCoa.inducks_issuequotation.findMany({
    where: {
      issuecode: {
        in: issueCodes,
      },
      estimationmin: {
        not: null,
      },
    },
  });

declare global {
  interface Array<T> {
    groupBy(fieldName: string): { [key: string]: T };
  }
}

Array.prototype.groupBy = function (fieldName: string): {
  [key: string]: never;
} {
  return this.reduce(
    (acc, object) => ({
      ...acc,
      [object[fieldName]]: object,
    }),
    {}
  );
};

export const get: Handler = async (req, res) => {
  const issueCodes = req.params.issueCodes?.split(",") || [];

  interface SimpleIssueWithPublication {
    countrycode: string;
    publicationcode: string;
    title: string;
    issuenumber: string;
    issuecode: string;
    coverId: number | null;
    coverUrl: string | null;
    popularity: number | null;
  }

  const covers: { [key: string]: cover } = (
    await prismaCoverInfo.cover.findMany({
      where: {
        issuecode: {
          in: issueCodes,
        },
      },
    })
  ).groupBy("issuecode");

  const issues = (
    (await prismaCoa.$queryRaw`
    SELECT pub.countrycode, pub.publicationcode, pub.title, issue.issuenumber, issue.issuecode
    FROM inducks_issue issue
    INNER JOIN coa.inducks_publication pub USING(publicationcode)
    WHERE issue.issuecode IN ${PrismaCoa.join(issueCodes)}
  `) as SimpleIssueWithPublication[]
  )
    .filter(({ issuecode }) => {
      if (!covers[issuecode]) {
        console.error(`No COA data exists for this issue : ${issuecode}`);
        return false;
      }
      return true;
    })
    .map((issue) => ({
      ...issue,
      issuenumber: issue.issuenumber.replace(/ +/g, " "),
      coverId: covers[issue.issuecode].id,
      coverUrl: covers[issue.issuecode].url,
    }))
    .groupBy("issuecode");

  const longIssueCodes = Object.keys(issues);
  const shortIssueCodes = longIssueCodes.reduce(
    (acc, longIssueCode) => ({
      [longIssueCode]: longIssueCode.replace(/ +/g, " "),
    }),
    {}
  );

  const quotations = await getIssueQuotations(issueCodes);
  console.log(quotations);
  const popularities = await prismaDm.issue.groupBy({
    by: ["issuecode"],
    where: {
      issuecode: {
        in: Object.values(shortIssueCodes),
      },
    },
    _count: {
      userId: true,
    },
  });
  for (const popularity of popularities) {
    const longIssueCode: string = Object.entries(shortIssueCodes).find(
      ([, shortIssueCode]) => shortIssueCode === popularity.issuecode
    )![0];
    issues[longIssueCode].popularity = popularity._count.userId;
  }
};
