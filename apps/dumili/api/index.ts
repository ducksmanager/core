import * as Sentry from "@sentry/node";
import busboy from "connect-busboy";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { router } from "express-file-routing";

import { authenticateToken } from "~routes/_auth";

dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

const port = 3002;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const app = express();
app.use(
  Sentry.Handlers.requestHandler({
    user: ["id", "username"],
  }) as express.RequestHandler
);
app.use(
  cors({
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(busboy({ immediate: true }));

app.all(/^.+$/, authenticateToken);

app.use(express.json({ limit: "5mb" }));

app.use("/", router());

app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
