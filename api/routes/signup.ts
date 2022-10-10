import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler } from "express";
import jwt from "jsonwebtoken";

import { PrismaClient } from "~prisma_clients/client_dm";
import { User } from "~types/SessionUser";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

const generateAccessToken = (payload: User) =>
  jwt.sign(payload, process.env.TOKEN_SECRET!, {
    expiresIn: `${60 * 24 * 14}m`,
  });

export const post = [
  parseForm,
  (async (req, res) => {
    const { username, password, password2, email } = req.body;
    if (!USERNAME_REGEX.test(username)) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("Invalid username");
    } else if (!EMAIL_REGEX.test(email)) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("Invalid email");
    } else if (password.length < 6) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("Your password should be at least 6 characters long");
    } else if (password !== password2) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("The two passwords should be identical");
    } else if (await prisma.user.count({ where: { username } })) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("This username is already taken");
    } else if (await prisma.user.count({ where: { email } })) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("This email is already used in another account");
    } else {
      const hashedPassword = crypto
        .createHash("sha1")
        .update(password)
        .digest("hex");
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

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ token }));
    }
  }) as Handler,
];
