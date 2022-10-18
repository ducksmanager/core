import bodyParser from "body-parser";
import { Handler } from "express";
import jwt from "jsonwebtoken";

import { PrismaClient } from "~/dist/prisma/client_dm";
import { isValidEmail } from "~/routes/auth/util";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

const generateToken = (payload: string) =>
  jwt.sign(payload, process.env.TOKEN_SECRET!, {
    expiresIn: "60m",
  });

export const get = (async (req, res) => {
  const { token } = req.query;
  jwt.verify(
    (token as string) || "",
    process.env.TOKEN_SECRET as string,
    (err: unknown) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/text" });
        res.end("Invalid token");
      }
      res.writeHead(200);
      res.end();
    }
  );
}) as Handler;

export const post = [
  parseForm,
  (async (req, res) => {
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

        //TODO send email
      } else {
        console.log(
          `A visitor requested to reset a password for an invalid e-mail: ${email}`
        );
      }
    }
  }) as Handler,
];
