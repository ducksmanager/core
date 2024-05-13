import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import multer from "multer";
import { Server } from "socket.io";

import { OptionalAuthMiddleware } from "~api/services/auth/util";
import type { SessionUser } from "~dm-types/SessionUser";

import * as generateDefaultEdge from "./generateDefaultEdge";
import text from "./services/text";
import browse from "./services/browse";
import imageInfo from "./services/image-info";
import save from "./services/save";
import uploadServices, { upload } from "./services/upload";
dotenv.config({
  path: "../.env",
});

const port = 3001;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

class ServerWithUser extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: SessionUser }
> {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

dotenv.config({
  path: "./.env",
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const app = express();

app.get("/upload", (req, res) => {
  if (req.method === "POST") {
    multer({
      dest: "/tmp/",
      limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
      },
    }).array("files");
    upload(req, res);
  } else {
    res.writeHead(405);
  }
});

app.get("/default-edge", (req, res) => {
  if (req.method === "OPTIONS") {
    generateDefaultEdge.options(req, res);
  } else if (req.method === "GET") {
    multer({
      dest: "/tmp/",
      limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
      },
    }).array("files");
    generateDefaultEdge.get(req, res);
  } else {
    res.writeHead(405);
  }
});
const httpServer = createServer(app);
const io = new ServerWithUser(httpServer, {
  cors: {
    origin: "*",
  },
});

httpServer.listen(port);
console.log(`WebSocket open on port ${port}`);

io.use(OptionalAuthMiddleware);

text(io);
browse(io);
imageInfo(io);
save(io);
uploadServices(io);
