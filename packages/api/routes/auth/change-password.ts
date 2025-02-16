import bodyParser from "body-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

import { loginAs } from "./util";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: { token: string };
      reqBody: { password: string; password2: string; token: string };
    }>
  ) => {
    const { password, password2, token } = req.body;
    jwt.verify(
      (token as string) || "",
      process.env.TOKEN_SECRET as string,
      async (err: unknown, data: unknown) => {
        if (err) {
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("Invalid token");
        } else if (password.length < 6) {
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("Your password should be at least 6 characters long");
        } else if (password !== password2) {
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("The two passwords should be identical");
        } else if (!('payload' in (data as { payload?: string }))) {
          console.error('Invalid token data:', data);
          res.writeHead(400, { "Content-Type": "application/text" });
          res.end("Invalid token");
        } else {
          const email = (data as { payload: string }).payload.split(',')[0];
          const hashedPassword = crypto
            .createHash("sha1")
            .update(password)
            .digest("hex");
          await prismaDm.user.updateMany({
            data: {
              password: hashedPassword,
            },
            where: {
              email,
            },
          });
          const user = (await prismaDm.user.findFirst({
            where: {
              email,
            },
          }))!;

          await prismaDm.userPasswordToken.deleteMany({
            where: {
              userId: user.id,
            },
          });

          return res.json({ token: await loginAs(user, hashedPassword) });
        }
      }
    );
  },
];
