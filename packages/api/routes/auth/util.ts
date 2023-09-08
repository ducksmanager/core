import jwt from "jsonwebtoken";
import { prismaDm } from "prisma-clients";
import { user } from "prisma-clients/client_dm";
import { User } from "types/SessionUser";

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

export const isValidEmail = (email: string) => EMAIL_REGEX.test(email);

export const generateAccessToken = (payload: User) =>
  jwt.sign(payload, process.env.TOKEN_SECRET!, {
    expiresIn: `${60 * 24 * 14}m`,
  });
export const loginAs = async (user: user, hashedPassword: string) =>
  generateAccessToken({
    id: user.id,
    username: user.username,
    hashedPassword,
    privileges: (
      await prismaDm.userPermission.findMany({
        where: {
          username: user.username,
        },
      })
    ).groupBy("role", "privilege"),
  });
