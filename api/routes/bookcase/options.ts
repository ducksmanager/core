import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { authenticateToken } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const post = [
  authenticateToken,
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: { status: string };
      reqBody: {
        textures: { bookcase: string; bookshelf: string };
        showAllCopies: boolean;
      };
    }>
  ) => {
    const { textures, showAllCopies } = req.body;
    const [, bookcaseTexture] = textures.bookcase.split("/");
    const [, bookshelfTexture] = textures.bookshelf.split("/");
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user!.id,
      },
    });

    user.bookcaseSubTexture1 = bookcaseTexture;
    user.bookcaseSubTexture2 = bookshelfTexture;
    user.showDuplicatesInBookcase = showAllCopies;
    await prisma.user.update({
      data: user,
      where: { id: user.id },
    });

    return res.json({ status: "OK" });
  },
];
