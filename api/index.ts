import * as Sentry from "@sentry/node";
import busboy from "connect-busboy";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { router } from "express-file-routing";

import {
  authenticateToken,
  checkUserIsAdmin,
  checkUserIsEdgeCreatorEditor,
  injectTokenIfValid,
} from "~routes/_auth";

dotenv.config({
  path: "../.env",
});

const port = 3000;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const app = express();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.set("json replacer", (key: string, value: any) =>
  typeof value === "bigint" ? Number(value) : value
);
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
app.use(cookieParser());

app.use(busboy({ immediate: true }));

app.all(/^.+$/, injectTokenIfValid);
app.all(
  /^\/(edgecreator\/(publish|edgesprites)|notifications)|(edges\/(published))|(\/demo\/reset)|(\/notification\/send)|(bookstores\/(approve|refuse))|(presentation-text\/(approve|refuse))/,
  [checkUserIsAdmin]
);

app.all(/^\/edgecreator\/(.+)/, [
  authenticateToken,
  checkUserIsEdgeCreatorEditor,
]);

app.all(/^\/global-stats\/user\/list$/, [
  authenticateToken,
  checkUserIsEdgeCreatorEditor,
]);

app.all(/^\/collection\/(.+)/, authenticateToken);
app.all("/global-stats/user/collection/rarity", authenticateToken);

app.use(express.json({ limit: "5mb" }));

app.use("/", router());

app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
