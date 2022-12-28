import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler, Request, Response } from "express";

import PresentationSentenceRequested from "~/emails/presentation-sentence-requested";
import { generateAccessToken, isValidEmail } from "~/routes/auth/util";
import { PrismaClient, user } from "~prisma_clients/client_dm";
import { exclude } from "~types/exclude";
import { ScopedError } from "~types/ScopedError";

const parseForm = bodyParser.json();
const prisma = new PrismaClient();

export const getUser = async (req: Request) =>
  await prisma.user.findUnique({
    where: { id: req.user.id },
  });

export type getType = Omit<user, "password">;

export const get: Handler = async (req, res: Response<getType>) => {
  const userWithoutPassword = exclude<user, "password">(
    await getUser(req),
    "password"
  );
  if (!userWithoutPassword) {
    res.writeHead(404, { "Content-Type": "application/text" });
    return res.end();
  }
  return res.json(userWithoutPassword);
};

export type delType = void;
export const del: Handler = async (req, res: Response<delType>) => {
  const { id: userId } = req.user;
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

export type postType = {
  hasRequestedPresentationSentenceUpdate: boolean;
} | void;
export const post = [
  parseForm,
  (async (req, res: Response<postType>) => {
    let hasRequestedPresentationSentenceUpdate = false;
    const input = req.body;
    let validators = [
      validateEmail,
      validateEmailUpdate,
      validatePresentationText,
    ];
    input.userId = req.user.id;
    if (req.body.password) {
      validators = [
        ...validators,
        validatePasswords,
        validatePasswordUpdate,
        validateOldPassword,
      ];
    }
    if (await validate(input, res, validators)) {
      if (req.body.password) {
        await prisma.user.update({
          data: {
            password: getHashedPassword(input.password),
          },
          where: {
            id: req.user.id,
          },
        });
      }
      const updatedUser = await prisma.user.update({
        data: {
          discordId: parseInt(input.discordId) || null,
          email: input.email,
          allowSharing: input.allowSharing,
          showPresentationVideo: input.showPresentationVideo,
        },
        where: { id: req.user.id },
      });
      if (updatedUser.presentationText !== input.presentationText) {
        hasRequestedPresentationSentenceUpdate = true;
        await new PresentationSentenceRequested({
          user: updatedUser,
          presentationText: input.presentationText,
        }).send();
      }
      return res.json({
        hasRequestedPresentationSentenceUpdate,
      });
    }
    res.statusCode = 400;
    return res.end();
  }) as Handler,
];

const validate = async (
  input: { [key: string]: unknown },
  res: Response,
  validators: ((input: { [key: string]: unknown }) => void)[]
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

export type putType = { token: string } | null;
export const put = [
  parseForm,
  (async (req, res: Response<putType>) => {
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
  }) as Handler,
];

const validateUsername = ({ username }: { [_: string]: unknown }) => {
  const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;
  if (!USERNAME_REGEX.test(username as string)) {
    throw {
      message: "Invalid username",
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
      message: "This username is already taken",
      selector: "#username",
    } as ScopedError;
  }
};

const validateEmailCreation = async ({ email }: { [_: string]: unknown }) => {
  if (await prisma.user.count({ where: { email: email as string } })) {
    throw {
      message: "This email is already used in another account",
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
      message: "This email is already used in another account",
      selector: "#email",
    } as ScopedError;
  }
};

const validateEmail = ({ email }: { [_: string]: unknown }) => {
  if (!isValidEmail(email as string)) {
    throw {
      message: "Invalid email",
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
      message: "Your password should be at least 6 characters long",
      selector: "#password",
    } as ScopedError;
  } else if (password !== password2) {
    throw {
      message: "The two passwords should be identical",
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
        "Both the old and the new password need to be filled if you want to change your password. If you don't want to change your password, leave both old and new passwords empty.",
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
  if (!presentationText || String(presentationText).length > 100) {
    throw {
      message: "The presentation text should be between 1 and 100 characters",
      selector: "#presentationText",
    } as ScopedError;
  }
};

function getHashedPassword(password: string) {
  return crypto.createHash("sha1").update(password).digest("hex");
}
