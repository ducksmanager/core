import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { authenticateToken } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export type postCall = Call<
  { status: string },
  undefined,
  { textures: { bookcase: string; bookshelf: string }; showAllCopies: boolean }
>;
export const post = [
  authenticateToken,
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
    const { textures, showAllCopies } = req.body;
    const [, bookcaseTexture] = textures.bookcase.split("/");
    const [, bookshelfTexture] = textures.bookshelf.split("/");
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
    });

    user.bookcaseSubTexture1 = bookcaseTexture;
    user.bookcaseSubTexture2 = bookshelfTexture;
    user.showDuplicatesInBookcase = showAllCopies;
    await prisma.user.update({
      data: user,
      where: { id: user.id },
    });

    res.writeHead(200, { "Content-Type": "application/text" });
    return res.json({ status: "OK" });
  },
];
