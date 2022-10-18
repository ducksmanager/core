import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler } from "express";

import { generateAccessToken, isValidEmail } from "~/routes/auth/util";
import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;

export const post = [
  parseForm,
  (async (req, res) => {
    const { username, password, password2, email } = req.body;
    if (!USERNAME_REGEX.test(username)) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end("Invalid username");
    } else if (!isValidEmail(email)) {
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
