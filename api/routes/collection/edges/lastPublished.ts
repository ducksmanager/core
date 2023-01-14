import { edge, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<edge[]>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
