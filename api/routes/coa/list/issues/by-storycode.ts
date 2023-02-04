import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { SimpleIssue } from "~types/SimpleIssue";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<
    SimpleIssue[],
    undefined,
    undefined,
    { storycode: string }
  >
) =>
  res.json(
    (await prisma.$queryRaw`
            SELECT issuecode as code,
                   publicationcode,
                   issuenumber
            FROM inducks_issue issue
                     INNER JOIN inducks_entry entry using (issuecode)
                     INNER JOIN inducks_storyversion sv using (storyversioncode)
            WHERE sv.storycode = ${req.query.storycode}
            GROUP BY publicationcode, issuenumber
            ORDER BY publicationcode`) as SimpleIssue[]
  );
