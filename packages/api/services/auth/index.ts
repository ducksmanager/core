import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Namespace, Server } from "socket.io";

import resetPassword from "~/emails/reset-password";
import { prismaDm } from "~/prisma";

import Events from "./types";
import { isValidEmail, loginAs } from "./util";

export enum COUNTRY_CODE_OPTION {
  ALL = "ALL",
  countries_to_notify = "countries_to_notify",
}

export default (io: Server) => {
  (io.of(Events.namespaceEndpoint) as Namespace<Events>).on(
    "connection",
    (socket) => {
      console.log("connected to auth");
      socket.on("forgot", async (token, callback) => {
        jwt.verify(token, process.env.TOKEN_SECRET as string, (err) => {
          callback({ error: err!.message || "" });
        });
      });

      socket.on("requestTokenForForgotPassword", async (email, callback) => {
        if (!isValidEmail(email)) {
          callback({ error: "Invalid email" });
        } else {
          const user = await prismaDm.user.findFirst({
            where: { email },
          });
          if (user) {
            console.log(
              `A visitor requested to reset a password for a valid e-mail: ${email}`
            );
            const token = jwt.sign(email, process.env.TOKEN_SECRET!, {
              expiresIn: "60m",
            });
            await prismaDm.userPasswordToken.create({
              data: { userId: user.id, token },
            });

            await new resetPassword({ user, token }).send();
            callback({ token });
          } else {
            console.log(
              `A visitor requested to reset a password for an invalid e-mail: ${email}`
            );
            callback({ error: "Invalid email" });
          }
        }
      });

      socket.on(
        "changePassword",
        async ({ password, password2, token }, callback) => {
          jwt.verify(
            token,
            process.env.TOKEN_SECRET as string,
            async (err: unknown, email: unknown) => {
              if (err) {
                callback({ error: "Invalid token" });
              } else if (password.length < 6) {
                callback({
                  error: "Your password should be at least 6 characters long",
                });
              } else if (password !== password2) {
                callback({ error: "The two passwords should be identical" });
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
          callback({ error: "Something went wrong" });
        }
      );
    }
  );
};
