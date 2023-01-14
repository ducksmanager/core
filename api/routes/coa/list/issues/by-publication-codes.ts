import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
import { simple_issue } from "~types/SimpleIssue";

const prisma = new PrismaClient();

export type getCall = Call<
  simple_issue[],
  undefined,
  undefined,
  { publicationCodes: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
  const publicationCodes = req.query.publicationCodes?.split(",") || [];
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
    data.map(({ publicationcode, issuenumber }) => ({
      code: "",
      publicationcode: publicationcode!,
      issuenumber: issuenumber!.replace(/ +/g, " "),
    }))
  );
};
