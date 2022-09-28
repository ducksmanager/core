// import { Handler } from "express";
//
// import {
//   inducks_issue,
//   PrismaClient as PrismaClientCoa,
// } from "../../../../prisma/generated/client_coa";
// import { PrismaClient as PrismaClientDm } from "../../../../prisma/generated/client_dm";
//
// const prismaCoa = new PrismaClientCoa();
// const prismaDm = new PrismaClientDm();
//
// export const get: Handler = async (req, res) => {
//   const { rawData } = req.body;
//   if (rawData.indexOf("country^entrycode^collectiontype^comment") === -1) {
//     res.writeHead(204);
//     res.end();
//     return;
//   }
//   const matches = [
//     ...new Set(rawData.match(/^((?!country)[^\n^]+^[^\n^]+)\^[^\n^]*^.*$/g)),
//   ].map((match) => (match as string).replace("^", "/"));
//   if (!matches.length) {
//     res.writeHead(204);
//     res.end();
//     return;
//   }
//
//   const issues = await prismaCoa.inducks_issue.findMany({
//     where: {
//       issuecode: {
//         in: matches,
//       },
//     },
//   });
//   const issueCodes = issues.map((issue) => issue.issuecode);
//
//   const issuesNotFound = matches.filter((match) => !issueCodes.includes(match));
// };
//
// const getNonPossessedIssues = async (
//   issues: inducks_issue[],
//   userId: number
// ) => {
//   const currentUserIssues = (
//     await prismaDm.issue.findMany({
//       where: { userId },
//     })
//   )
//     .map(({ country, magazine, issueNumber }) => ({
//       publicationcode: `${country}/${magazine}`,
//       issueNumber,
//     }))
//     .reduce(
//       (acc, value) => ({
//         ...acc,
//         [`${value.publicationcode}`]: [
//           ...(acc[`${value.publicationcode}`] || []),
//           value.issueNumber,
//         ],
//       }),
//       {}
//     );
// };
