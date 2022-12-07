import { Handler } from "express";

import {
  Prisma as PrismaCoa,
  PrismaClient as PrismaClientCoa,
} from "~prisma_clients/client_coa";
import {
  cover,
  PrismaClient as PrismaClientCoverInfo,
} from "~prisma_clients/client_cover_info";
import {
  Prisma,
  PrismaClient as PrismaClientDm,
} from "~prisma_clients/client_dm";

const prismaCoa = new PrismaClientCoa();
const prismaCoverInfo = new PrismaClientCoverInfo();
const prismaDm = new PrismaClientDm();

type ReturnType<FieldValue, T> = FieldValue extends string ? never : T;

declare global {
  interface Array<T> {
    groupBy<FieldValue>(
      fieldName: string,
      valueFieldName?: FieldValue
    ): { [key: string]: ReturnType<FieldValue, T> };
  }
}

Array.prototype.groupBy = function (fieldName, valueFieldName?) {
  return this.reduce(
    (acc, object) => ({
      ...acc,
      [object[fieldName]]: valueFieldName
        ? object[valueFieldName] || undefined
        : object,
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

  const covers: { [issuecode: string]: cover } = (
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

  // const quotations = await getIssueQuotations(issueCodes);

  const popularities = (await prismaDm.$queryRaw`
    SELECT issuecode, COUNT(DISTINCT ID_Utilisateur) AS userCount
    FROM numeros
    WHERE issuecode IN (${Prisma.join(Object.values(shortIssueCodes))})
    GROUP BY issuecode
  `) as { issuecode: string; userCount: number }[];

  for (const { issuecode, userCount } of popularities) {
    const longIssueCode: string = Object.entries(shortIssueCodes).find(
      ([, shortIssueCode]) => shortIssueCode === issuecode
    )![0];
    issues[longIssueCode].popularity = userCount;
  }

  return res.json(issues);
};
