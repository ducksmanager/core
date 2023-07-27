import { prismaCoa } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[, res]: ExpressCall<{ resBody: Record<string, number> }>
) =>
  res.json(
    (
      await prismaCoa.inducks_issue.groupBy({
        _count: {
          issuenumber: true,
        },
        by: ["publicationcode"],
      })
    ).reduce(
      (acc, { publicationcode, _count }) => ({
        ...acc,
        [publicationcode!]: _count.issuenumber,
      }),
      {} as { [publicationcode: string]: number }
    )
  );
