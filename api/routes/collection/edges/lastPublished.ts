import { Handler, Response } from "express";

import { edge, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export type getType = edge[];
export const get: Handler = async (req, res: Response<getType>) => {
  const userId = req.user.id;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const userIssues = (
    await prisma.issue.findMany({
      where: {
        userId,
      },
      select: {
        country: true,
        magazine: true,
        issuenumber: true,
      },
    })
  ).map(
    (issue) => `${issue.country}/${issue.magazine} ${issue.issuenumber}`
  ) as string[];
  return res.json(
    await prisma.edge.findMany({
      where: {
        creationDate: {
          gt: threeMonthsAgo,
        },
        issuecode: {
          in: userIssues,
        },
      },
      take: 5,
    })
  );
};
