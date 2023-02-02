import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<undefined, undefined, { issueIds: number[] }>
  ) => {
    const issueIds = req.body.issueIds || [];
    if (issueIds.find((issueId: number) => isNaN(issueId))) {
      res.writeHead(400);
      res.end(`Invalid issue ID list, NaN`);
      return;
    }
    const issues = await prisma.issue.findMany({
      where: {
        id: { in: issueIds },
        isOnSale: true,
      },
    });
    if (issues.length !== issueIds.length) {
      res.writeHead(400);
      res.end(
        `The provided issue IDs (${issueIds.length} provided)were not all found (${issues.length} found)`
      );
      return;
    }
    const alreadyRequestedIssueIds = (
      await prisma.requestedIssue.findMany({
        select: {
          issueId: true,
        },
        where: {
          buyerId: req.user!.id,
          issueId: { in: issueIds },
        },
      })
    ).map(({ issueId }) => issueId);
    const newlyRequestedIssueIds = issueIds.filter(
      (issueId: number) => !alreadyRequestedIssueIds.includes(issueId)
    );
    await prisma.requestedIssue.createMany({
      data: newlyRequestedIssueIds.map((issueId: number) => ({
        buyerId: req.user!.id,
        issueId,
      })),
    });
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];

export const del = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<undefined, undefined, { issueId: number }>
  ) => {
    const { issueId } = req.body;

    await prisma.requestedIssue.deleteMany({
      where: {
        buyerId: req.user!.id,
        issueId,
      },
    });
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];
