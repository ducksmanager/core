import axios from "axios";

import { User } from "~/server/user";

export const runQuery = (
  query: string,
  db: string,
  parameters: { [string]: never } = {}
) =>
  fetch({
    path: "/rawsql",
    role: "rawsql",
    parameters: {
      query: query.trim(),
      parameters: JSON.stringify(parameters),
      db,
    },
    method: "POST",
  });

export const fetch = async ({
  path,
  role = "ducksmanager",
  parameters = {},
  method = "GET",
  headers = {},
  user = null,
}: {
  path: string;
  role?: string;
  parameters?: { [string]: never };
  method?: string;
  headers?: { [string]: never };
  user?: User;
}) =>
  await axios
    .request({
      url: `${process.env.BACKEND_URL}${path}`,
      auth: {
        username: role,
        password: process.env[`ROLE_PASSWORD_${role.toUpperCase()}`],
      },
      data: parameters,
      method,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "x-dm-version": "1.0",
        ...headers,
        ...(user
          ? {
              "x-dm-user": user?.username,
              "x-dm-pass": user?.passwordHash,
            }
          : {}),
      },
    })
    .catch((e) => {
      // console.error(e);
      throw e;
    });
