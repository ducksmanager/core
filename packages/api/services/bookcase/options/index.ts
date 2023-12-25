
import { prismaDm } from "~/prisma";

import { Socket } from "../types";
import { checkValidBookcaseUser } from "../util";

export default (socket: Socket) => {
  socket.on("getBookcaseOptions", async (username, callback) => {
    const user = await checkValidBookcaseUser(null, username);
    if (user.error) {
      callback({ error: user.error })
    }
    else {
      callback({
        textures: {
          bookcase: `${user.bookcaseTexture1}/${user.bookcaseSubTexture1}`,
          bookshelf: `${user.bookcaseTexture2}/${user.bookcaseSubTexture2}`,
        },
        showAllCopies: user.showDuplicatesInBookcase,
      });
    }
  });
};

export const authenticated = (socket: Socket) => {
  socket.on("setBookcaseOptions", async ({ textures, showAllCopies }, callback) => {
    const [, bookcaseTexture] = textures.bookcase.split("/");
    const [, bookshelfTexture] = textures.bookshelf.split("/");
    const user = await prismaDm.user.findUniqueOrThrow({
      where: {
        id: socket.data.user!.id,
      },
    });

    user.bookcaseSubTexture1 = bookcaseTexture;
    user.bookcaseSubTexture2 = bookshelfTexture;
    user.showDuplicatesInBookcase = showAllCopies;
    await prismaDm.user.update({
      data: user,
      where: { id: user.id },
    });

    callback("OK");
  });
}