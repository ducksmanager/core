import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Namespace, Server } from "socket.io";

import resetPassword from "~/emails/reset-password";
import { prismaClient } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import {
  EmailCreationValidation,
  EmailValidation,
  PasswordValidation,
  UsernameCreationValidation,
  UsernameValidation,
  validate,
} from "../collection/user/util";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
import {
  generateAccessToken,
  getHashedPassword,
  isValidEmail,
  loginAs,
} from "./util";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
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
        const user = await prismaClient.user.findFirst({
          where: { email },
        });
        if (user) {
          console.log(
            `A visitor requested to reset a password for a valid e-mail: ${email}`,
          );
          const token = jwt.sign(email, process.env.TOKEN_SECRET!, {
            expiresIn: "60m",
          });
          await prismaClient.userPasswordToken.create({
            data: { userId: user.id, token },
          });

          await new resetPassword({ user, token }).send();
          callback({ token });
        } else {
          console.log(
            `A visitor requested to reset a password for an invalid e-mail: ${email}`,
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
          async (err: unknown, data: unknown) => {
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
              await prismaClient.user.updateMany({
                data: {
                  password: hashedPassword,
                },
                where: {
                  email: (data as { payload: string }).payload,
                },
              });
              const user = (await prismaClient.user.findFirst({
                where: {
                  email: (data as { payload: string }).payload,
                },
              }))!;

              callback({ token: await loginAs(user, hashedPassword) });
            }
          },
        );
        callback({ error: "Something went wrong" });
      },
    );

    socket.on("getCsrf", (callback) => callback(""));

    socket.on("signup", async (input, callback) => {
      console.log(`signup with user ${input.username}`);
      await prismaDm.$transaction(async (transaction) => {
        const scopedError = await validate(transaction, input, [
          new UsernameValidation(),
          new UsernameCreationValidation(),
          new EmailValidation(),
          new EmailCreationValidation(),
          // new PasswordValidation(),
        ]);
        if (scopedError) {
          callback({ error: scopedError });
        } else {
          const { username, password, email } = input;
          const hashedPassword = getHashedPassword(password);
          const user = await transaction.user.create({
            data: {
              username,
              password: hashedPassword,
              email,
              signupDate: new Date(),
            },
          });

          const privileges = (
            await transaction.userPermission.findMany({
              where: {
                username,
              },
            })
          ).groupBy("role", "privilege");
          const token = generateAccessToken({
            id: user.id,
            username,
            hashedPassword,
            privileges,
          });

          callback(token);
        }
      });
    });

    socket.on("login", async ({ username, password }, callback) => {
      console.log("login");
      const hashedPassword = getHashedPassword(password);
      const user = await prismaDm.user.findFirst({
        where: {
          username,
          password: hashedPassword,
        },
      });
      if (user) {
        const token = await loginAs(user, hashedPassword);

        callback(token);
      } else {
        callback({ error: "Invalid username or password" });
      }
    });

    socket.on("loginAsDemo", async (callback) => {
      const demoUser = await prismaDm.user.findFirst({
        where: { username: "demo" },
      });
      if (!demoUser) {
        callback({ error: "No demo user found" });
      } else {
        const token = await loginAs(
          demoUser,
          getHashedPassword(demoUser!.password),
        );

        callback({ token });
      }
    });
  });
};
