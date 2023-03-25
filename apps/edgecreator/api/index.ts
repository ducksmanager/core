import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { router } from "express-file-routing";

import {
  authenticateToken,
  checkUserIsAdminForExportOrIsEditorForSaveOrIsFirstFileForModel,
  checkUserIsAdminOrEditor,
  injectTokenIfValid,
} from "~routes/_auth";

dotenv.config({
  path: "../.env",
});

const port = 3001;

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
app.use(cookieParser());

app.all(/^.+$/, injectTokenIfValid);
app.all(/^\/fs\/save$/, [
  authenticateToken,
  checkUserIsAdminForExportOrIsEditorForSaveOrIsFirstFileForModel,
]);
app.all(/^\/fs\/(text|upload|upload-base64)$/, [
  authenticateToken,
  checkUserIsAdminOrEditor,
]);

app.use("/", router());

app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

app.listen(port, () =>
  console.log(`EdgeCreator API listening on port ${port}`)
);
