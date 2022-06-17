import jwt from "jsonwebtoken";

import { fetch } from "~/server/fetch";
import { User } from "~/server/user";

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  const { roles } = (
    await fetch({
      path: "/collection/privileges",
      method: "GET",
      headers: {
        "x-dm-user": user.username,
        "x-dm-pass": user.passwordHash,
        "x-dm-version": "1.0",
      },
    })
  ).data;

  const fullUser: User = {
    ...user,
    roles,
  };
  const token = jwt.sign(fullUser, process.env.JWT_SECRET);

  return {
    roles,
    token,
  };
});
