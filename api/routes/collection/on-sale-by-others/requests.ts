import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~/dist/prisma/client_dm";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      await prisma.requestedIssue.findMany({
        where: {
          buyerId: req.user.id,
          isEmailSent: false,
        },
      })
    )
  );
};

export const put = [
  parseForm,
  (async (req, res) => {
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
    await prisma.requestedIssue.createMany({
      data: issueIds.map((issueId: string) => ({
        buyerId: req.user.id,
        issueId: parseInt(issueId),
      })),
    });
    res.writeHead(200);
    res.end();
  }) as Handler,
];
