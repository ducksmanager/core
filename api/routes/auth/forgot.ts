import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

import ResetPassword from "~emails/reset-password";
import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

import { isValidEmail } from "./util";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

const generateToken = (payload: string) =>
  jwt.sign(payload, process.env.TOKEN_SECRET!, {
    expiresIn: "60m",
  });

export const get = async (
  ...[req, res]: ExpressCall<{ query: { token: string } }>
) => {
  jwt.verify(
    req.query.token,
    process.env.TOKEN_SECRET as string,
    (err: unknown) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/text" });
        res.end("Invalid token");
      }
      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    }
  );
};

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: { token: string };
      reqBody: { email: string };
    }>
  ) => {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("Invalid email");
    } else {
      const user = await prisma.user.findFirst({
        where: { email },
      });
      if (user) {
        console.log(
          `A visitor requested to reset a password for a valid e-mail: ${email}`
        );
        const token = generateToken(email);
        await prisma.userPasswordToken.create({
          data: { userId: user.id, token },
        });

        await new ResetPassword({ user, token }).send();
        return res.json({ token });
      } else {
        console.log(
          `A visitor requested to reset a password for an invalid e-mail: ${email}`
        );
        res.writeHead(400, { "Content-Type": "application/text" });
        res.end("Invalid email");
      }
    }
  },
];
