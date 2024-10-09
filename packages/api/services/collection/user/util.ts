import type { user } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { getHashedPassword, isValidEmail } from "~services/auth/util";

interface ScopedError<ErrorKey extends string = string> {
  error: ErrorKey;
  message: string;
  selector: string;
}

export type ScopedErrorDetails = {
  message: ScopedError["message"];
  selector: ScopedError["selector"];
};

export const getUser = async (id: number) =>
  await prismaDm.user.findUniqueOrThrow({
    omit: { password: true },
    where: { id },
  });

export const validate = async (
  input: Record<string, unknown>,
  validators: Validation[],
): Promise<ScopedErrorDetails | undefined> => {
  for (const validator of validators) {
    const result = await validator.run(input);
    if (result?.message) {
      return result;
    }
  }
};

export abstract class Validation {
  abstract run(
    data: Record<string, unknown>,
  ): Promise<ScopedErrorDetails | undefined>;
}

export class UsernameValidation extends Validation {
  run = async ({ username }: Pick<user, "username">) => {
    if (!/^[-_A-Za-z0-9]{3,15}$/.test(username)) {
      return {
        message: "Nom d'utilisateur invalide",
        selector: "#username",
      } as const;
    }
  };
}

export class UsernameCreationValidation extends Validation {
  run = async ({ username }: Pick<user, "username">) =>
    prismaDm.user
      .findFirstOrThrow({
        where: { username },
      })
      .then(
        () =>
          ({
            message: "Ce nom d'utilisateur est déjà pris",
            selector: "#username",
          }) as const,
      )
      .catch(() => undefined);
}

export class EmailCreationValidation extends Validation {
  run = async ({ email }: Pick<user, "email">) =>
    prismaDm.user
      .findFirstOrThrow({
        where: { email },
      })
      .then(
        () =>
          ({
            message: "Cet e-mail est déjà utilisé par un autre compte",
            selector: "#email",
          }) as const,
      )
      .catch(() => undefined);
}

export class EmailUpdateValidation extends Validation {
  run = async ({ id, email }: Pick<user, "email" | "id">) =>
    prismaDm.user
      .findUniqueOrThrow({
        select: {
          email: true,
        },
        where: { id },
      })
      .then(async ({ email: currentEmail }) =>
        currentEmail === email
          ? true
          : (await prismaDm.user.count({
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
            selector: "#email",
          }) as const,
      );
}

export class EmailValidation extends Validation {
  run = async ({ email }: Pick<user, "email">) => {
    if (!isValidEmail(email)) {
      return {
        message: "Adresse e-mail invalide",
        selector: "#email",
      } as const;
    }
  };
}

export class PasswordValidation extends Validation {
  run = async ({
    password,
  }: {
    password: user["password"];
  }) =>
    password.length < 6
      ? ({
        message: "Le mot de passe doit comporter au moins 6 caractères",
        selector: "#password",
      } as const)
      : undefined;
}

export class PasswordUpdateValidation extends Validation {
  run = async ({
    oldPassword,
    password,
  }: {
    oldPassword: user["password"];
    password: user["password"];
  }) =>
    !oldPassword || !password
      ? ({
        selector: "#password",
        message:
          "L'ancien et le nouveau mot de passe doivent être remplis si vous souhaitez changer de mot de passe. Si vous ne souhaitez pas changer de mot de passe, laissez les champs correspondant à l'ancien et au nouveau mots de passe vides.",
      } as const)
      : undefined;
}

export class OldPasswordValidation extends Validation {
  run = async ({
    userId,
    oldPassword,
  }: {
    userId: user["id"];
    oldPassword: user["password"];
  }) =>
    prismaDm.user
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
            selector: "#oldPassword",
          }) as const,
      );
}

export class PresentationTextValidation extends Validation {
  run = async ({ presentationText }: Pick<user, "presentationText">) =>
    String(presentationText).length > 100
      ? ({
        message:
          "Le texte de présentation doit comporter entre 1 et 100 caractères",
        selector: "#presentationText",
      } as const)
      : undefined;
}

export class DiscordIdValidation extends Validation {
  run = async ({ discordId }: Pick<user, "discordId">) =>
    discordId && !/^\d+$/.test(String(discordId))
      ? ({
        message:
          "L'identifiant Discord doit être un nombre. Cliquez sur \"Comment trouver mon identifiant de profil Discord ?\" pour plus d'informations.",
        selector: "#discordId",
      } as const)
      : undefined;
}
