import bodyParser from "body-parser";
import crypto from "crypto";
import csrf from "csurf";
import { Express } from "express";
import jwt from "jsonwebtoken";

import { call } from "../call-api";

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.json();

const generateAccessToken = (payload: { [key: string]: any }) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: `${60 * 24 * 14}m`,
  });

export default {
  addRoutes: (app: Express) => {
    app.get("/csrf", csrfProtection, async (req, res) => {
      res.end(JSON.stringify({ csrfToken: req.csrfToken() }));
    });

    app.post("/login", parseForm, async (req, res) => {
      const { username, password } = req.body;
      const privileges = (
        await call("/collection/privileges", "ducksmanager", {}, "GET", true, {
          username,
          password: crypto.createHash("sha1").update(password).digest("hex"),
        })
      ).data;
      const token = generateAccessToken({ username, privileges });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ token }));
    });
  },
};
