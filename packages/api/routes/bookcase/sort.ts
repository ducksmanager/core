import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { authenticateToken } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

export const post = [
  authenticateToken,
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: { max: number } | undefined;
      reqBody: { sorts: string[] };
    }>
  ) => {
    const sorts = req.body.sorts;
    if (sorts.length) {
      const userId = req.user!.id;
      await prismaDm.bookcasePublicationOrder.deleteMany({
        where: { userId: userId },
      });
      let order = 0;
      const insertOperations = sorts.map((publicationcode: string) =>
        prismaDm.bookcasePublicationOrder.create({
          data: {
            publicationcode,
            order: order++,
            userId,
          },
        })
      );
      await prismaDm.$transaction(insertOperations);

      return res.json({ max: order - 1 });
    }
    res.statusCode = 400;
    res.end();
  },
];
