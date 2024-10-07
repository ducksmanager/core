import { EdgeWithStringCreationDate } from "~dm-types/EdgeWithStringCreationDate";
import prismaDm from "~prisma-schemas/extended/dm.extends";
import { ExpressCall } from "~routes/_express-call";


export const get = async (...[req, res]: ExpressCall<{ resBody: EdgeWithStringCreationDate[] }>) => {
  const userId = req.user!.id;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const userIssues = (
    await prismaDm.issue.findMany({
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
    (await prismaDm.edge.findMany({
      where: {
        creationDate: {
          gt: threeMonthsAgo,
        },
        issuecode: {
          in: userIssues,
        },
      },
      take: 5,
    })).map((edge) => ({
      ...edge,
      creationDate: edge.creationDate.toISOString(),
    }))
  );
};
