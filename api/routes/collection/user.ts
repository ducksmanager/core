import bodyParser from "body-parser";
import { Response } from "express";

import PresentationSentenceRequested from "~emails/presentation-sentence-requested";
import { PrismaClient, user } from "~prisma_clients/client_dm";
import { getHashedPassword } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";
import { generateAccessToken, isValidEmail } from "~routes/auth/util";
import { exclude } from "~types/exclude";
import { ScopedError } from "~types/ScopedError";
import { UserForAccountForm } from "~types/UserForAccountForm";

const parseForm = bodyParser.json();
const prisma = new PrismaClient();

export const getUser = async (id: number) =>
  await prisma.user.findUnique({
    where: { id },
  });

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: Omit<user, "password"> }>
) => {
  const userWithoutPassword = exclude<user, "password">(
    await getUser(req.user!.id),
    "password"
  );
  if (!userWithoutPassword) {
    res.writeHead(404, { "Content-Type": "application/text" });
    return res.end();
  }
  return res.json(userWithoutPassword);
};

export const del = async (
  ...[req, res]: ExpressCall<Record<string, never>>
) => {
  const userId = req.user!.id;
  await prisma.issue.deleteMany({
    where: { userId },
  });
  await prisma.authorUser.deleteMany({
    where: { userId },
  });
  await prisma.purchase.deleteMany({
    where: { userId },
  });
  await prisma.userOption.deleteMany({
    where: { userId },
  });
  await prisma.user.delete({
    where: { id: userId },
  });

  res.writeHead(200, { "Content-Type": "application/text" });
  res.end();
};

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: {
        hasRequestedPresentationSentenceUpdate: boolean;
      };
      reqBody: UserForAccountForm;
    }>
  ) => {
    let hasRequestedPresentationSentenceUpdate = false;
    const input = req.body;
    let validators = [
      validateEmail,
      validateEmailUpdate,
      validatePresentationText,
    ];
    input.userId = req.user!.id;
    if (input.password) {
      validators = [
        ...validators,
        validatePasswords,
        validatePasswordUpdate,
        validateOldPassword,
      ];
    }
    if (await validate(input, res, validators)) {
      if (input.password) {
        await prisma.user.update({
          data: {
            password: getHashedPassword(input.password),
          },
          where: {
            id: req.user!.id,
          },
        });
      }
      const updatedUser = await prisma.user.update({
        data: {
          discordId: input.discordId || undefined,
          email: input.email,
          allowSharing: input.allowSharing,
          marketplaceAcceptsExchanges: input.okForExchanges,
        },
        where: { id: req.user!.id },
      });
      if (updatedUser.presentationText !== input.presentationText) {
        if (!input.presentationText) {
          await prisma.user.update({
            data: {
              presentationText: null,
            },
            where: { id: req.user!.id },
          });
        } else {
          hasRequestedPresentationSentenceUpdate = true;
          await new PresentationSentenceRequested({
            user: updatedUser,
            presentationText: input.presentationText,
          }).send();
        }
      }
      return res.json({
        hasRequestedPresentationSentenceUpdate,
      });
    }
    res.statusCode = 400;
    return res.end();
  },
];

const validate = async (
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

export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: { token: string };
      reqBody: {
        username: string;
        password: string;
        email: string;
      } & Record<string, unknown>;
    }>
  ) => {
    const isValid = await validate(req.body, res, [
      validateUsername,
      validateUsernameCreation,
      validateEmail,
      validateEmailCreation,
      validatePasswords,
    ]);
    if (isValid) {
      const { username, password, email } = req.body;
      const hashedPassword = getHashedPassword(password);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          signupDate: new Date(),
        },
      });

      const privileges = (
        await prisma.userPermission.findMany({
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

      return res.json({ token });
    }
    res.statusCode = 400;
    return res.end();
  },
];

const validateUsername = ({ username }: { [_: string]: unknown }) => {
  const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;
  if (!USERNAME_REGEX.test(username as string)) {
    throw {
      message: "Nom d'utilisateur invalide",
      selector: "#username",
    } as ScopedError;
  }
};

const validateUsernameCreation = async ({
  username,
}: {
  [_: string]: unknown;
}) => {
  if (await prisma.user.count({ where: { username: username as string } })) {
    throw {
      message: "Ce nom d'utilisateur est déjà pris",
      selector: "#username",
    } as ScopedError;
  }
};

const validateEmailCreation = async ({ email }: { [_: string]: unknown }) => {
  if (await prisma.user.count({ where: { email: email as string } })) {
    throw {
      message: "Cet e-mail est déjà utilisé par un autre compte",
      selector: "#email",
    } as ScopedError;
  }
};

const validateEmailUpdate = async ({
  email,
  userId,
}: {
  [_: string]: unknown;
}) => {
  const currentEmail = (
    await prisma.user.findUniqueOrThrow({
      select: {
        email: true,
      },
      where: { id: userId as number },
    })
  ).email;
  if (
    currentEmail !== currentEmail &&
    (await prisma.user.count({
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

const validateEmail = ({ email }: { [_: string]: unknown }) => {
  if (!isValidEmail(email as string)) {
    throw {
      message: "Adresse e-mail invalide",
      selector: "#email",
    } as ScopedError;
  }
};

const validatePasswords = ({
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

const validatePasswordUpdate = ({
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

const validateOldPassword = async ({
  userId,
  oldPassword,
}: {
  [_: string]: unknown;
}) => {
  const hashedPassword = getHashedPassword(oldPassword as string);
  if (
    !(await prisma.user.findFirst({
      where: { id: userId as number, password: hashedPassword },
    }))
  ) {
    throw {
      message: "L'ancien mot de passe est invalide.",
      selector: "#oldPassword",
    } as ScopedError;
  }
};

const validatePresentationText = ({
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
