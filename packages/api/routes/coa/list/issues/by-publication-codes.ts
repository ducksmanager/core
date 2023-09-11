import { SimpleIssue } from "~dm-types/SimpleIssue";

import { prismaCoa } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: SimpleIssue[];
    query: { publicationCodes: string };
  }>
) => {
  const publicationCodes = req.query.publicationCodes?.split(",") || [];
  if (publicationCodes.length > 50) {
    res.writeHead(400);
    res.end();
    return;
  }
  const data = await prismaCoa.inducks_issue.findMany({
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
