import crypto from "crypto";
import { useBody } from "h3";
import jwt from "jsonwebtoken";

import { fetch } from "~/server/fetch";
import { User, UserCredentials } from "~/server/user";

export default defineEventHandler(async (event) => {
  const body = await useBody(event);

  const shaPassword = crypto.createHash("sha1");
  shaPassword.update(body.password);
  const passwordHash = shaPassword.digest("hex");

  const userCredentials: UserCredentials = {
    username: body.username,
    passwordHash,
  };
  const { roles } = (
    await fetch({
      path: "/collection/privileges",
      method: "GET",
      userCredentials,
    })
  ).data;

  const fullUser: User = {
    ...userCredentials,
    roles,
    id: 117,
  };
  const token = jwt.sign(fullUser, process.env.JWT_SECRET);

  return {
    username: body.username,
    roles,
    token,
  };
});
