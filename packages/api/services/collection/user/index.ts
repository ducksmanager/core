import type { Errorable } from "socket-call-server";

import type { UserForAccountForm } from "~dm-types/UserForAccountForm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import PresentationSentenceRequested from "../../../emails/presentation-sentence-requested";
import type { UserServices } from "../../../index";
import { getHashedPassword } from "../../auth/util";
import type { Validation } from "./util";
import {
  DiscordIdValidation,
  EmailUpdateValidation,
  EmailValidation,
  getUser,
  OldPasswordValidation,
  PasswordUpdateValidation,
  PasswordValidation,
  PresentationTextValidation,
  validate,
} from "./util";

export default ({ _socket }: UserServices) => ({
  getUser: async () =>
    getUser(_socket.data.user!.id).catch(() => ({ error: "User not found" })),

  deleteUser: async () => {
    const userId = _socket.data.user!.id;
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
  },

  updateUser: async (
    input: UserForAccountForm,
  ): Promise<
    Errorable<
      { hasRequestedPresentationSentenceUpdate: boolean },
      "Bad request"
    >
  > => {
    let hasRequestedPresentationSentenceUpdate = false;
    let validators: Validation[] = [
      new DiscordIdValidation(),
      new EmailValidation(),
      new EmailUpdateValidation(),
      new PresentationTextValidation(),
    ];
    input.userId = _socket.data.user!.id;
    if (input.password) {
      validators = [
        ...validators,
        new PasswordValidation(),
        new PasswordUpdateValidation(),
        new OldPasswordValidation(),
      ];
    }
    return new Promise(async (resolve) => {
      let hasResolved = false;
      await prismaDm.$transaction(async (transaction) => {
        const scopedError = await validate(transaction, input, validators);
        if (scopedError) {
          resolve({ error: "Bad request", ...scopedError });
          hasResolved = true;
        }
      });

      if (!hasResolved) {
        if (input.password) {
          await prismaDm.user.update({
            data: {
              password: getHashedPassword(input.password),
            },
            where: {
              id: _socket.data.user!.id,
            },
          });
        }
        const updatedUser = await prismaDm.user.update({
          data: {
            discordId: input.discordId || undefined,
            email: input.email,
            allowSharing: input.allowSharing,
            marketplaceAcceptsExchanges: input.marketplaceAcceptsExchanges,
          },
          where: { id: _socket.data.user!.id },
        });
        if (updatedUser.presentationText !== input.presentationText) {
          if (!input.presentationText) {
            await prismaDm.user.update({
              data: {
                presentationText: null,
              },
              where: { id: _socket.data.user!.id },
            });
          } else {
            hasRequestedPresentationSentenceUpdate = true;
            await new PresentationSentenceRequested({
              user: updatedUser,
              presentationText: input.presentationText,
            }).send();
          }
        }
        resolve({
          hasRequestedPresentationSentenceUpdate,
        });
      }
    });
  },
});
