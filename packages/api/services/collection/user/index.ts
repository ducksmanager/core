
import { prismaDm } from "~/prisma";
import { getHashedPassword } from "~/services/auth/util";
import { exclude } from "~dm-types/exclude";
import PresentationSentenceRequested from "~emails/presentation-sentence-requested";
import { user } from "~prisma-clients/client_dm";
import { generateAccessToken } from "~routes/auth/util";

import { Socket } from "../types";
import { getUser, validate, validateDiscordId, validateEmail, validateEmailCreation, validateEmailUpdate, validateOldPassword, validatePasswords, validatePasswordUpdate, validatePresentationText, validateUsername, validateUsernameCreation } from "./util";

export default (socket: Socket) => {
  socket.on("getUser", async (callback) => {
    const userWithoutPassword = exclude<user, "password">(
      await getUser(socket.data.user!.id),
      "password"
    );
    callback(userWithoutPassword || { error: 'User not found' });
  });

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
    callback()
  });

  socket.on('updateUser', async (input, callback) => {
    let hasRequestedPresentationSentenceUpdate = false;
    let validators = [
      validateDiscordId,
      validateEmail,
      validateEmailUpdate,
      validatePresentationText,
    ];
    input.userId = socket.data.user!.id;
    if (input.password) {
      validators = [
        ...validators,
        validatePasswords,
        validatePasswordUpdate,
        validateOldPassword,
      ];
    }
    if (await validate(input, callback, validators)) {
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
    callback({ error: 'Bad request' });
  });

  socket.on('createUser', async (input, callback) => {
    const isValid = await validate(input, callback, [
      validateUsername,
      validateUsernameCreation,
      validateEmail,
      validateEmailCreation,
      validatePasswords,
    ]);
    if (isValid) {
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
    else {
      callback({ error: 'Bad request' });
    }
  })
}