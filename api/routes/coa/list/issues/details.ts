import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

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

  const entries = (await prisma.$queryRaw`
      SELECT sv.storycode,
             sv.kind,
             sv.entirepages,
             entry.title,
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
  `) as {
    storycode: string;
    kind: string;
    entirepages: number;
    title: string;
    url: string;
    position: string;
  }[];
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ releaseDate, entries }));
};
