import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

import { checkValidBookcaseUser } from "./index";

export type getCall = Call<
  {
    textures: {
      bookcase: string;
      bookshelf: string;
    };
    showAllCopies: boolean;
  },
  { username: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
