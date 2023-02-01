import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
import { simple_issue } from "~types/SimpleIssue";

const prisma = new PrismaClient();

export type getCall = Call<
  simple_issue[],
  undefined,
  undefined,
  { storycode: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) =>
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
            ORDER BY publicationcode`) as simple_issue[]
  );
