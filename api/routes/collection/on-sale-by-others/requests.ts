import bodyParser from "body-parser";
import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export type putType = void;
export const put = [
  parseForm,
  (async (req, res: Response<putType>) => {
    const issueIds = (req.body.issueIds || []).map((issueId: never) =>
      parseInt(issueId)
    );
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
          buyerId: req.user.id,
          issueId: { in: issueIds.map((issueId: string) => parseInt(issueId)) },
        },
      })
    ).map(({ issueId }) => issueId);
    const newlyRequestedIssueIds = issueIds.filter(
      (issueId: string) => !alreadyRequestedIssueIds.includes(parseInt(issueId))
    );
    await prisma.requestedIssue.createMany({
      data: newlyRequestedIssueIds.map((issueId: string) => ({
        buyerId: req.user.id,
        issueId: parseInt(issueId),
      })),
    });
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  }) as Handler,
];

export type deleteType = void;
export const del = [
  parseForm,
  (async (req, res: Response<deleteType>) => {
    const { issueId } = req.body;

    await prisma.requestedIssue.deleteMany({
      where: {
        buyerId: req.user.id,
        issueId,
      },
    });
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  }) as Handler,
];
