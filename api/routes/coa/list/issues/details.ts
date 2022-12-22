import { Handler } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

const getEntries = async (
  publicationcode: string,
  issuenumber: string
): Promise<
  {
    storycode: string;
    kind: string;
    entirepages: number;
    title: string;
    part: number;
    url: string;
    position: string;
  }[]
> =>
  await prisma.$queryRaw`
      SELECT sv.storycode,
             sv.kind,
             sv.entirepages,
             entry.title,
             entry.part,
             CONCAT(IF(sitecode = 'thumbnails', 'webusers', sitecode), '/', url) AS url,
             entry.position
      FROM inducks_issue
               INNER JOIN inducks_entry AS entry using (issuecode)
               INNER JOIN inducks_storyversion AS sv using (storyversioncode)
               LEFT JOIN inducks_entryurl AS entryurl using (entrycode)
      WHERE inducks_issue.publicationcode = ${publicationcode}
        AND (REPLACE(issuenumber, ' ', '') = ${issuenumber})
      GROUP BY entry.entrycode, position
      ORDER BY position
  `;

export type getType = {
  releaseDate: string;
  entries: Prisma.PromiseReturnType<typeof getEntries>;
};
export const get: Handler = async (req, res) => {
  const { publicationcode, issuenumber } = req.query;

  const releaseDate = (
    (await prisma.$queryRaw`
      SELECT issue.oldestdate
      FROM inducks_issue issue
      WHERE issue.publicationcode = ${publicationcode}
        AND REPLACE(issue.issuenumber, ' ', '') = ${issuenumber}`) as {
      oldestdate: string;
    }[]
  )[0]?.oldestdate;

  const entries = await getEntries(
    publicationcode as string,
    issuenumber as string
  );
  return res.json({ releaseDate, entries });
};
