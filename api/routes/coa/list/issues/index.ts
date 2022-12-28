import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export type getType = { [publicationcode: string]: string[] };
export const get: Handler = async (req, res: Response<getType>) => {
  const { storycode } = req.query;
  if (storycode) {
    return res.json({
      results: await prisma.$queryRaw`
            SELECT issuecode as code,
                   publicationcode,
                   issuenumber
            FROM inducks_issue issue
                     INNER JOIN inducks_entry entry using (issuecode)
                     INNER JOIN inducks_storyversion sv using (storyversioncode)
            WHERE sv.storycode = ${storycode}
            GROUP BY publicationcode, issuenumber
            ORDER BY publicationcode`,
    });
  }
  const publicationCodes =
    (req.query as { [key: string]: string }).publicationCodes?.split(",") || [];
  if (publicationCodes.length > 50) {
    res.writeHead(400);
    res.end();
    return;
  }
  const data = await prisma.inducks_issue.findMany({
    select: {
      publicationcode: true,
      issuenumber: true,
    },
    where: {
      publicationcode: {
        in: publicationCodes,
      },
    },
  });
  return res.json(
    data.reduce(
      (acc, { publicationcode, issuenumber }) => ({
        ...acc,
        [publicationcode!]: [
          ...(acc[publicationcode!] || []),
          issuenumber!.replace(/ +/g, " "),
        ],
      }),
      {} as { [publicationcode: string]: string[] }
    )
  );
};
