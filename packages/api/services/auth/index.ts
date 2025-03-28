import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Errorable } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { prismaClient } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

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
        const token = jwt.sign(
          { exp: Math.floor(Date.now() / 1000) + 60 * 60, data: email },
          process.env.TOKEN_SECRET!,
        );
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
  }) =>
    new Promise<Errorable<{ token: string }, string>>((resolve) => {
      jwt.verify(
        token,
        process.env.TOKEN_SECRET as string,
        async (err: unknown, data: unknown) => {
          if (err) {
            resolve({ error: "Invalid token" } as const);
          } else if (password.length < 6) {
            resolve({
              error: "Your password should be at least 6 characters long",
            } as const);
          } else if (password !== password2) {
            resolve({
              error: "The two passwords should be identical",
            } as const);
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

            resolve({ token: await loginAs(user, hashedPassword) } as const);
          }
        },
      );
      resolve({ error: "Something went wrong" } as const);
    }),

  getCsrf: async () => "",

  signup: (input: { username: string; password: string; email: string }) =>
    new Promise<Errorable<string, "Bad request">>((resolve) => {
      console.log(`signup with user ${input.username}`);
      prismaDm.$transaction(async (transaction) => {
        const scopedError = await validate(transaction, input, [
          new UsernameValidation(),
          new UsernameCreationValidation(),
          new EmailValidation(),
          new EmailCreationValidation(),
          new PasswordValidation(),
        ]);
        if (scopedError) {
          resolve({ error: "Bad request", ...scopedError } as const);
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
        getHashedPassword(demoUser.password),
      );

      return { token };
    }
  },
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.AUTH,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
