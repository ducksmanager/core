import { AxiosError } from "axios";
import { Express } from "express";

import { call } from "../call-api";
import { authenticateToken } from "./auth";

export default {
  addRoutes: (app: Express) => {
    app.all(/^\/api\/collection\/(.+)/, authenticateToken);
    app.all(/^\/api\/collection\/(.+)/, async (req, res) => {
      const path = req.params[0];
      const userCredentials = {
        username: req.user.username,
        password: req.user.hashedPassword,
      };
      try {
        const response = await call(
          `/collection/${path}`,
          "ducksmanager",
          req.body,
          req.method,
          true,
          userCredentials
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response.data));
      } catch (e: any) {
        const error = e as AxiosError;
        res.statusCode = error.response?.status || 500;
        console.error(error.message);
        res.end();
      }
    });
  },
};
