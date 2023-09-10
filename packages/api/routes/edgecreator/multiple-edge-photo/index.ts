import bodyParser from "body-parser";
import { prismaEdgeCreator } from "~/prisma";

import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();
export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: {
        photo: { id: number };
      };
      reqBody: {
        hash: string;
        filename: string;
      };
    }>
  ) =>
    res.json({
      photo: {
        id: (
          await prismaEdgeCreator.elementImage.create({
            data: { hash: req.body.hash, fileName: req.body.filename },
          })
        ).id,
      },
    }),
];
