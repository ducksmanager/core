import crypto from "crypto";
import { useBody } from "h3";
import jwt from "jsonwebtoken";

import { fetch } from "~/server/fetch";
import { User } from "~/server/user";

export default defineEventHandler(async (event) => {
  const body = await useBody(event);

  const shaPassword = crypto.createHash("sha1");
  shaPassword.update(body.password);
  const passwordHash = shaPassword.digest("hex");

  const user = {
    username: body.username,
    passwordHash,
  };
  const { roles } = (
    await fetch({
      path: "/collection/privileges",
      method: "GET",
      user,
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
