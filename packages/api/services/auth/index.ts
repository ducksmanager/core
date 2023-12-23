import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Namespace, Server } from "socket.io";

import { prismaDm } from "~/prisma";

import { Services } from "./types";
import { loginAs } from "./util";

export enum COUNTRY_CODE_OPTION {
  ALL = "ALL",
  countries_to_notify = "countries_to_notify",
}

export default (io: Server) => {
  (io.of("/auth") as Namespace<Services>).on(
    "connection",
    (socket) => {
      socket.on("forgot", async (token, callback) => {
        jwt.verify(
          token,
          process.env.TOKEN_SECRET as string,
          (err) => {
            callback({ error: err!.message || '' })
          }
        );
      });

      socket.on('changePassword', async ({ password, password2, token }, callback) => {
        jwt.verify(
          token,
          process.env.TOKEN_SECRET as string,
          async (err: unknown, email: unknown) => {
            if (err) {
              callback(({ error: 'Invalid token' }))
            } else if (password.length < 6) {
              callback(({ error: 'Your password should be at least 6 characters long' }));
            } else if (password !== password2) {
              callback(({ error: 'The two passwords should be identical' }));
            } else {
              const hashedPassword = crypto
                .createHash("sha1")
                .update(password)
                .digest("hex");
              await prismaDm.user.updateMany({
                data: {
                  password: hashedPassword,
                },
                where: {
                  email: email as string,
                },
              });
              const user = (await prismaDm.user.findFirst({
                where: {
                  email: email as string,
                },
              }))!;
              await loginAs(user, hashedPassword);

              callback({ token });
            }
          }
        );
        callback({ error: 'Something went wrong' })
      })
    });
};
