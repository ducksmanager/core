import { ExpressCall } from "~routes/_express-call";

import { checkValidBookcaseUser } from "./index";

export const get = async (
  ...[req, res]: ExpressCall<
    {
      textures: {
        bookcase: string;
        bookshelf: string;
      };
      showAllCopies: boolean;
    },
    { username: string }
  >
) => {
  const user = await checkValidBookcaseUser(req.user, req.params.username);
  if (user !== null) {
    return res.json({
      textures: {
        bookcase: `${user.bookcaseTexture1}/${user.bookcaseSubTexture1}`,
        bookshelf: `${user.bookcaseTexture2}/${user.bookcaseSubTexture2}`,
      },
      showAllCopies: user.showDuplicatesInBookcase,
    });
  }
};
