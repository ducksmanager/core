import { prismaCoa } from "~/prisma";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: SimpleIssue[];
    query: { storycode: string };
  }>
) =>
  res.json(
    (await prismaCoa.$queryRaw`
            SELECT issuecode,
                   publicationcode,
                   issuenumber
            FROM inducks_issue issue
                     INNER JOIN inducks_entry entry using (issuecode)
                     INNER JOIN inducks_storyversion sv using (storyversioncode)
            WHERE sv.storycode = ${req.query.storycode}
            GROUP BY publicationcode, issuenumber
            ORDER BY publicationcode`) as SimpleIssue[]
  );
