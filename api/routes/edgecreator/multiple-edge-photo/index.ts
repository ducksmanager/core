import bodyParser from "body-parser";

import { PrismaClient } from "~/dist/prisma/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();
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
          await prisma.elementImage.create({
            data: { hash: req.body.hash, fileName: req.body.filename },
          })
        ).id,
      },
    }),
];
