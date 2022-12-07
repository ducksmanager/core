import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler } from "express";
import jwt from "jsonwebtoken";

import { PrismaClient } from "~/dist/prisma/client_dm";
import { loginAs } from "~/routes/auth/util";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  (async (req, res) => {
    const { password, password2, token } = req.body;
    jwt.verify(
      (token as string) || "",
      process.env.TOKEN_SECRET as string,
      async (err: unknown, email: unknown) => {
        if (err) {
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("Invalid token");
        } else if (password.length < 6) {
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("Your password should be at least 6 characters long");
        } else if (password !== password2) {
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("The two passwords should be identical");
        } else {
          const hashedPassword = crypto
            .createHash("sha1")
            .update(password)
            .digest("hex");
          await prisma.user.updateMany({
            data: {
              password: hashedPassword,
            },
            where: {
              email: email as string,
            },
          });
          const user = (await prisma.user.findFirst({
            where: {
              email: email as string,
            },
          }))!;
          await loginAs(user, hashedPassword);

          return res.json({ token });
        }
      }
    );
  }) as Handler,
];
