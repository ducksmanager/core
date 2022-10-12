import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

import { authenticateToken } from "../login";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();
export const post = [
  authenticateToken,
  parseForm,
  (async (req, res) => {
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
    res.end("OK");
  }) as Handler,
];
