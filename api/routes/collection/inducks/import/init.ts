import { inducks_issue } from "~prisma_clients/client_coa";
import { PrismaClient as PrismaClientCoa } from "~prisma_clients/client_coa";
import { PrismaClient as PrismaClientDm } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
const prismaCoa = new PrismaClientCoa();
const prismaDm = new PrismaClientDm();

export type postCall = Call<
  {
    issues: inducks_issue[];
    nonFoundIssues: string[];
    existingIssuesCount: number;
  },
  undefined,
  { rawData: string }
>;
export const post = async (...[req, res]: ExpressCall<postCall>) => {
  const { rawData } = req.body;
  if (rawData.indexOf("country^entrycode^collectiontype^comment") === -1) {
    res.writeHead(204);
    res.end();
    return;
  }
  const matches = [
    ...new Set(rawData.match(/^((?!country)[^\n^]+^[^\n^]+)\^[^\n^]*^.*$/g)),
  ].map((match) => (match as string).replace("^", "/"));
  if (!matches.length) {
    res.writeHead(204);
    res.end();
    return;
  }

  const issues = await prismaCoa.inducks_issue.findMany({
    where: {
      issuecode: {
        in: matches,
      },
    },
  });
  const issueCodes = issues.map((issue) => issue.issuecode);

  const issuesNotFound = matches.filter((match) => !issueCodes.includes(match));

  const newIssues = await getNonPossessedIssues(issues, req.user.id);

  return res.json({
    issues: newIssues,
    nonFoundIssues: issuesNotFound,
    existingIssuesCount: issues.length - newIssues.length,
  });
};

const getNonPossessedIssues = async (
  issues: inducks_issue[],
  userId: number
) => {
  const currentUserIssuesByPublication = (
    await prismaDm.issue.findMany({
      where: { userId },
    })
  ).reduce(
    (acc, { country, magazine, issuenumber }) => ({
      ...acc,
      [`${country}/${magazine}`]: [
        ...(acc[`${country}/${magazine}`] || []),
        issuenumber,
      ],
    }),
    {} as { [publicationcode: string]: string[] }
  );

  return issues.filter(({ publicationcode, issuenumber }) =>
    currentUserIssuesByPublication[publicationcode!]?.includes(issuenumber!)
  );
};
