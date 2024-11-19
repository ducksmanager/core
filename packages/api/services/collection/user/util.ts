import type { user } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { getHashedPassword, isValidEmail } from "~services/auth/util";

type PrismaDmTransaction = Parameters<
  Parameters<typeof prismaDm.$transaction>[0]
>[0];

export type ScopedError<ErrorKey extends string = string> = {
  name: ErrorKey;
  message: string;
}

export const getUser = async (id: number, transaction = prismaDm) =>
  await transaction.user.findUniqueOrThrow({
    omit: { password: true },
    where: { id },
  });

export const validate = async<T extends string>(
  transaction: PrismaDmTransaction,
  input: Record<T, unknown>,
  validators: Validation<T[]>[],
): Promise<ScopedError<T> | undefined> => {
  for (const validator of validators) {
    const result = await validator.run(input, transaction);
    if (result?.message) {
      return result;
    }
  }
};

export abstract class Validation<T extends string[]> {
  abstract run(
    data: Record<T[number], unknown>,
    transaction: PrismaDmTransaction,
  ): Promise<ScopedError<T[number]> | undefined>;
}

export class UsernameValidation extends Validation<['username']> {
  run = async ({ username }: user) => {
    if (!/^[-_A-Za-z0-9]{3,25}$/.test(username)) {
      return {
        message: "Nom d'utilisateur invalide",
        name: "username",
      } as const;
    }
  };
}

export class UsernameCreationValidation extends Validation<['username']> {
  run = async (
    { username }: user,
    transaction: PrismaDmTransaction,
  ) =>
    transaction.user
      .findFirstOrThrow({
        where: { username },
      })
      .then(
        () =>
          ({
            message: "Ce nom d'utilisateur est déjà pris",
            name: "username",
          }) as const,
      )
      .catch(() => undefined);
}

export class EmailCreationValidation extends Validation<['email']> {
  run = async (
    { email }: user,
    transaction: PrismaDmTransaction,
  ) =>
    transaction.user
      .findFirstOrThrow({
        where: { email },
      })
      .then(
        () =>
          ({
            message: "Cet e-mail est déjà utilisé par un autre compte",
            name: "email",
          }) as const,
      )
      .catch(() => undefined);
}

export class EmailUpdateValidation extends Validation<['email']> {
  run = async (
    { id, email }: user,
    transaction: PrismaDmTransaction,
  ) =>
    transaction.user
      .findUniqueOrThrow({
        select: {
          email: true,
        },
        where: { id },
      })
      .then(async ({ email: currentEmail }) =>
        currentEmail === email
          ? true
          : (await transaction.user.count({
            where: {
              email,
            },
          })) === 0,
      )
      .then(() => undefined)
      .catch(
        () =>
          ({
            message: "Cet e-mail est déjà utilisé par un autre compte",
            name: "email",
          }) as const,
      );
}

export class EmailValidation extends Validation<['email']> {
  run = async ({ email }: user) => {
    if (!isValidEmail(email)) {
      return {
        message: "Adresse e-mail invalide",
        name: "email",
      } as const;
    }
  };
}

export class PasswordValidation extends Validation<['password', 'passwordConfirmation']> {
  run = async ({ password, passwordConfirmation }: { password: user["password"], passwordConfirmation: user["password"] }) =>
    password.length < 6
      ? ({
        message: "Le mot de passe doit comporter au moins 6 caractères",
        name: "password",
      } as const)
      : password !== passwordConfirmation ? ({
        message: "Les mots de passe ne correspondent pas",
        name: "password",
      } as const)
        : undefined
}

export class PasswordUpdateValidation extends Validation<['oldPassword', 'password']> {
  run = async ({
    oldPassword,
    password,
  }: {
    oldPassword: user["password"];
    password: user["password"];
  }) =>
    !oldPassword || !password
      ? ({
        name: "password",
        message:
          "L'ancien et le nouveau mot de passe doivent être remplis si vous souhaitez changer de mot de passe. Si vous ne souhaitez pas changer de mot de passe, laissez les champs correspondant à l'ancien et au nouveau mots de passe vides.",
      } as const)
      : undefined;
}

export class OldPasswordValidation extends Validation<['userId', 'oldPassword']> {
  run = async (
    {
      userId,
      oldPassword,
    }: {
      userId: user["id"];
      oldPassword: user["password"];
    },
    transaction: PrismaDmTransaction,
  ) =>
    transaction.user
      .findFirstOrThrow({
        where: {
          id: userId,
          password: getHashedPassword(oldPassword),
        },
      })
      .then(() => undefined)
      .catch(
        () =>
          ({
            message: "L'ancien mot de passe est invalide.",
            name: "oldPassword",
          }) as const,
      );
}

export class PresentationTextValidation extends Validation<['presentationText']> {
  run = async ({ presentationText }: user) =>
    String(presentationText).length > 100
      ? ({
        message:
          "Le texte de présentation doit comporter entre 1 et 100 caractères",
        name: "presentationText",
      } as const)
      : undefined;
}

export class DiscordIdValidation extends Validation<['discordId']> {
  run = async ({ discordId }: user) =>
    discordId && !/^\d+$/.test(String(discordId))
      ? ({
        message:
          "L'identifiant Discord doit être un nombre. Cliquez sur \"Comment trouver mon identifiant de profil Discord ?\" pour plus d'informations.",
        name: "discordId",
      } as const)
      : undefined;
}
