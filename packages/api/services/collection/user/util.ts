import { Response } from "express";

import { prismaDm } from "~/prisma";
import { ScopedError } from "~dm-types/ScopedError";
import { getHashedPassword } from "~routes/_auth";
import { isValidEmail } from "~routes/auth/util";


export const getUser = async (id: number) =>
  await prismaDm.user.findUnique({
    where: { id },
  });

export const validate = async (
  input: Record<string, unknown>,
  res: Response,
  validators: ((input: Record<string, unknown>) => void)[]
): Promise<boolean> => {
  for (const validator of validators) {
    try {
      await validator(input);
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      console.log(e);
      res.end(JSON.stringify(e));
      return false;
    }
  }
  return true;
};

export const validateUsername = ({ username }: { [_: string]: unknown }) => {
  const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;
  if (!USERNAME_REGEX.test(username as string)) {
    throw {
      message: "Nom d'utilisateur invalide",
      selector: "#username",
    } as ScopedError;
  }
};

export const validateUsernameCreation = async ({
  username,
}: {
  [_: string]: unknown;
}) => {
  if (await prismaDm.user.count({ where: { username: username as string } })) {
    throw {
      message: "Ce nom d'utilisateur est déjà pris",
      selector: "#username",
    } as ScopedError;
  }
};

export const validateEmailCreation = async ({ email }: { [_: string]: unknown }) => {
  if (await prismaDm.user.count({ where: { email: email as string } })) {
    throw {
      message: "Cet e-mail est déjà utilisé par un autre compte",
      selector: "#email",
    } as ScopedError;
  }
};

export const validateEmailUpdate = async ({
  email,
  userId,
}: {
  [_: string]: unknown;
}) => {
  const currentEmail = (
    await prismaDm.user.findUniqueOrThrow({
      select: {
        email: true,
      },
      where: { id: userId as number },
    })
  ).email;
  if (
    currentEmail !== currentEmail &&
    (await prismaDm.user.count({
      where: {
        email: email as string,
        id: {
          notIn: [userId as number],
        },
      },
    }))
  ) {
    throw {
      message: "Cet e-mail est déjà utilisé par un autre compte",
      selector: "#email",
    } as ScopedError;
  }
};

export const validateEmail = ({ email }: { [_: string]: unknown }) => {
  if (!isValidEmail(email as string)) {
    throw {
      message: "Adresse e-mail invalide",
      selector: "#email",
    } as ScopedError;
  }
};

export const validatePasswords = ({
  password,
  password2,
}: {
  [_: string]: unknown;
}) => {
  if ((password as string).length < 6) {
    throw {
      message: "Le mot de passe doit comporter au moins 6 caractères",
      selector: "#password",
    } as ScopedError;
  } else if (password !== password2) {
    throw {
      message: "Le mot de passe et sa confirmation doivent être identiques",
      selector: "#password",
    } as ScopedError;
  }
};

export const validatePasswordUpdate = ({
  oldPassword,
  password,
}: {
  [_: string]: unknown;
}) => {
  if (!oldPassword || !password) {
    throw {
      selector: "#password",
      message:
        "L'ancien et le nouveau mot de passe doivent être remplis si vous souhaitez changer de mot de passe. Si vous ne souhaitez pas changer de mot de passe, laissez les champs correspondant à l'ancien et au nouveau mots de passe vides.",
    };
  }
};

export const validateOldPassword = async ({
  userId,
  oldPassword,
}: {
  [_: string]: unknown;
}) => {
  const hashedPassword = getHashedPassword(oldPassword as string);
  if (
    !(await prismaDm.user.findFirst({
      where: { id: userId as number, password: hashedPassword },
    }))
  ) {
    throw {
      message: "L'ancien mot de passe est invalide.",
      selector: "#oldPassword",
    } as ScopedError;
  }
};

export const validatePresentationText = ({
  presentationText,
}: {
  [_: string]: unknown | null;
}) => {
  if (String(presentationText).length > 100) {
    throw {
      message:
        "Le texte de présentation doit comporter entre 1 et 100 caractères",
      selector: "#presentationText",
    } as ScopedError;
  }
};

export const validateDiscordId = ({ discordId }: { [_: string]: unknown | null }) => {
  if (discordId && !/^\d+$/.test(String(discordId))) {
    throw {
      message:
        "L'identifiant Discord doit être un nombre. Cliquez sur \"Comment trouver mon identifiant de profil Discord ?\" pour plus d'informations.",
      selector: "#discordId",
    } as ScopedError;
  }
};
