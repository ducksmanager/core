import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const { storycode } = req.params;
  if (storycode) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        await prisma.$queryRaw`
              SELECT issuecode as code,
                     publicationcode,
                     issuenumber
              FROM inducks_issue issue
                       INNER JOIN inducks_entry entry using (issuecode)
                       INNER JOIN inducks_storyversion sv using (storyversioncode)
              WHERE sv.storycode = ${storycode})
              ORDER BY publicationcode
              GROUP BY publicationcode, issuenumber`
      )
    );
    return;
  }
  const publicationCodes =
    (req.query as { [key: string]: string }).publicationCodes?.split(",") || [];
  if (publicationCodes.length > 50) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "application/json" });
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
  console.log(data);
  res.end(
    JSON.stringify(
      data.reduce(
        (acc, { publicationcode, issuenumber }) => ({
          ...acc,
          [publicationcode!]: [
            ...(acc[publicationcode!] || []),
            issuenumber!.replace(/ +/g, " "),
          ],
        }),
        {} as { [key: string]: string[] }
      )
    )
  );
};
