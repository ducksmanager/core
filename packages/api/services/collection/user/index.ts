import type { Socket } from "socket.io";

import { prismaDm } from "~/prisma";
import PresentationSentenceRequested from "~emails/presentation-sentence-requested";
import { generateAccessToken, getHashedPassword } from "~services/auth/util";

import type Events from "../types";
import type {
  Validation} from "./util";
import {
  DiscordIdValidation,
  EmailCreationValidation,
  EmailUpdateValidation,
  EmailValidation,
  getUser,
  OldPasswordValidation,
  PasswordsValidation,
  PasswordUpdateValidation,
  PresentationTextValidation,
  UsernameCreationValidation,
  UsernameValidation,
  validate
} from "./util";

export default (socket: Socket<Events>) => {
  socket.on("getUser", async (callback) =>
    getUser(socket.data.user!.id)
      .then(callback)
      .catch(() => callback({ error: "User not found" })),
  );

  socket.on("deleteUser", async (callback) => {
    const userId = socket.data.user!.id;
    await prismaDm.issue.deleteMany({
      where: { userId },
    });
    await prismaDm.authorUser.deleteMany({
      where: { userId },
    });
    await prismaDm.purchase.deleteMany({
      where: { userId },
    });
    await prismaDm.userOption.deleteMany({
      where: { userId },
    });
    await prismaDm.user.delete({
      where: { id: userId },
    });
    callback();
  });

  socket.on("updateUser", async (input, callback) => {
    let hasRequestedPresentationSentenceUpdate = false;
    let validators: Validation[] = [
      new DiscordIdValidation(),
      new EmailValidation(),
      new EmailUpdateValidation(),
      new PresentationTextValidation(),
    ];
    input.userId = socket.data.user!.id;
    if (input.password) {
      validators = [
        ...validators,
        new PasswordsValidation(),
        new PasswordUpdateValidation(),
        new OldPasswordValidation(),
      ];
    }
    const scopedError = await validate(input, validators);
    if (scopedError) {
      callback({ error: "Bad request", ...scopedError });
    } else {
      if (input.password) {
        await prismaDm.user.update({
          data: {
            password: getHashedPassword(input.password),
          },
          where: {
            id: socket.data.user!.id,
          },
        });
      }
      const updatedUser = await prismaDm.user.update({
        data: {
          discordId: input.discordId ? parseInt(input.discordId) : undefined,
          email: input.email,
          allowSharing: input.allowSharing,
          marketplaceAcceptsExchanges: input.okForExchanges,
        },
        where: { id: socket.data.user!.id },
      });
      if (updatedUser.presentationText !== input.presentationText) {
        if (!input.presentationText) {
          await prismaDm.user.update({
            data: {
              presentationText: null,
            },
            where: { id: socket.data.user!.id },
          });
        } else {
          hasRequestedPresentationSentenceUpdate = true;
          await new PresentationSentenceRequested({
            user: updatedUser,
            presentationText: input.presentationText,
          }).send();
        }
      }
      callback({
        hasRequestedPresentationSentenceUpdate,
      });
    }
  });

  socket.on("createUser", async (input, callback) => {
    const scopedError = await validate(input, [
      new UsernameValidation(),
      new UsernameCreationValidation(),
      new EmailValidation(),
      new EmailCreationValidation(),
      new PasswordsValidation(),
    ]);
    if (scopedError) {
      callback({ error: "Bad request", ...scopedError });
    } else {
      const { username, password, email } = input;
      const hashedPassword = getHashedPassword(password);
      const user = await prismaDm.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          signupDate: new Date(),
        },
      });

      const privileges = (
        await prismaDm.userPermission.findMany({
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

      callback({ token });
    }
  });
};
