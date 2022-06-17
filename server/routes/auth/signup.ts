import crypto from "crypto";
import { useBody } from "h3";
import jwt from "jsonwebtoken";

import { fetch } from "~/server/fetch";
import { User } from "~/server/user";

export default defineEventHandler(async (event) => {
  const body = await useBody(event);

  await fetch({
    path: "/ducksmanager/user",
    parameters: body,
    method: "PUT",
  });

  const shaPassword = crypto.createHash("sha1");
  shaPassword.update(body.password);

  const passwordHash = shaPassword.digest("hex");
  const roles = (
    await fetch({
      path: "/collection/privileges",
      method: "GET",
      headers: {
        "x-dm-user": body.username,
        "x-dm-pass": passwordHash,
        "x-dm-version": "1.0",
      },
    })
  ).data;

  const user: User = {
    username: body.username,
    passwordHash,
    roles,
  };
  const token = jwt.sign(user, process.env.JWT_SECRET);

  return {
    roles,
    token,
  };
});
