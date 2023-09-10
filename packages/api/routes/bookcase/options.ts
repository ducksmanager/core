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
    const user = await prismaDm.user.findUniqueOrThrow({
      where: {
        id: req.user!.id,
      },
    });

    user.bookcaseSubTexture1 = bookcaseTexture;
    user.bookcaseSubTexture2 = bookshelfTexture;
    user.showDuplicatesInBookcase = showAllCopies;
    await prismaDm.user.update({
      data: user,
      where: { id: user.id },
    });

    return res.json({ status: "OK" });
  },
];
