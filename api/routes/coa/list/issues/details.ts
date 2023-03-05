import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { SimpleEntry } from "~types/SimpleEntry";

const prisma = new PrismaClient();

const getEntries = async (
  publicationcode: string,
  issuenumber: string
): Promise<SimpleEntry[]> =>
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

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      releaseDate: string;
      entries: SimpleEntry[];
    };
    query: { publicationcode: string; issuenumber: string };
  }>
) => {
  const { publicationcode, issuenumber } = req.query;

  const releaseDate = (
    (await prisma.$queryRaw`
      SELECT issue.oldestdate
      FROM inducks_issue issue
      WHERE issue.publicationcode = ${req.query.publicationcode}
        AND REPLACE(issue.issuenumber, ' ', '') = ${req.query.issuenumber}`) as {
      oldestdate: string;
    }[]
  )[0]?.oldestdate;

  const entries = await getEntries(
    publicationcode as string,
    issuenumber as string
  );
  return res.json({ releaseDate, entries });
};
