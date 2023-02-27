import { edge } from "~prisma_clients/client_dm";
import prisma from "~prisma_extended_clients/dm.extends";
import { ExpressCall } from "~routes/_express-call";

export const get = async (...[req, res]: ExpressCall<{ resBody: edge[] }>) => {
  const userId = req.user!.id;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const userIssues = (
    await prisma.issue.findMany({
      where: {
        userId,
      },
      select: {
        publicationcode: true,
        issuenumber: true,
      },
    })
  ).map((issue) => `${issue.publicationcode} ${issue.issuenumber}`) as string[];
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
