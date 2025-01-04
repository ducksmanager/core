import crypto from "crypto";
import jwt from "jsonwebtoken";

import { prismaClient } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import type { Errorable } from "~socket.io-services";
import { useSocketServices } from "~socket.io-services";

import resetPassword from "../../emails/reset-password";
import {
  EmailCreationValidation,
  EmailValidation,
  PasswordValidation,
  UsernameCreationValidation,
  UsernameValidation,
  validate,
} from "../collection/user/util";
import namespaces from "../namespaces";
import {
  generateAccessToken,
  getHashedPassword,
  isValidEmail,
  loginAs,
} from "./util";

const listenEvents = () => ({
  forgot: async (token: string) =>
    new Promise((resolve) => {
      jwt.verify(token, process.env.TOKEN_SECRET as string, (err) => {
        resolve({ error: err!.message || "" });
      });
    }),
  requestTokenForForgotPassword: async (email: string) => {
    if (!isValidEmail(email)) {
      return { error: "Invalid email" };
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
        return { token };
      } else {
        console.log(
          `A visitor requested to reset a password for an invalid e-mail: ${email}`,
        );
        return { error: "Invalid email" };
      }
    }
  },

  changePassword: async ({
    password,
    password2,
    token,
  }: {
    password: string;
    password2: string;
    token: string;
  }): Promise<Errorable<{ token: string }, string>> =>
    new Promise((resolve) => {
      jwt.verify(
        token,
        process.env.TOKEN_SECRET as string,
        async (err: unknown, data: unknown) => {
          if (err) {
            resolve({ error: "Invalid token" });
          } else if (password.length < 6) {
            resolve({
              error: "Your password should be at least 6 characters long",
            });
          } else if (password !== password2) {
            resolve({ error: "The two passwords should be identical" });
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

            resolve({ token: await loginAs(user, hashedPassword) });
          }
        },
      );
      resolve({ error: "Something went wrong" });
    }),

  getCsrf: async () => "",

  signup: (input: {
    username: string;
    password: string;
    email: string;
  }): Promise<Errorable<string, "Bad request">> =>
    new Promise(async (resolve) => {
      console.log(`signup with user ${input.username}`);
      await prismaDm.$transaction(async (transaction) => {
        const scopedError = await validate(transaction, input, [
          new UsernameValidation(),
          new UsernameCreationValidation(),
          new EmailValidation(),
          new EmailCreationValidation(),
          new PasswordValidation(),
        ]);
        if (scopedError) {
          resolve({ error: "Bad request", ...scopedError });
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

          resolve(token);
        }
      });
    }),

  login: async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
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

      return token;
    } else {
      return { error: "Invalid username or password" };
    }
  },

  loginAsDemo: async () => {
    const demoUser = await prismaDm.user.findFirst({
      where: { username: "demo" },
    });
    if (!demoUser) {
      return { error: "No demo user found" };
    } else {
      const token = await loginAs(
        demoUser,
        getHashedPassword(demoUser!.password),
      );

      return { token };
    }
  },
});

export const { client, server } = useSocketServices<typeof listenEvents>(
  namespaces.AUTH,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
