import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

import { instrument } from "@socket.io/admin-ui";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

import * as generateDefaultEdge from "./generateDefaultEdge";
import { server as browse } from "./services/browse";
import { server as imageInfo } from "./services/image-info";
import { server as save } from "./services/save";
import { server as text } from "./services/text";
import { server as upload } from "./services/upload";

const port = 3001;

export const getEdgesPath = () =>
  process.env.EDGES_PATH!.startsWith("/")
    ? process.env.EDGES_PATH!
    : `${import.meta.dirname}/../../${process.env.EDGES_PATH!}`;

export interface SessionData {
  user?: SessionUser;
  token: string;
}

class ServerWithUser extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  SessionData
> {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const app = express();

app.get(
  "/default-edge/edges/:countrycode/gen/:magazinecode([^.]+).:issuenumber([^.]+).:extension(svg|png)",
  (req, res) => {
    if (req.method === "OPTIONS") {
      generateDefaultEdge.options(req, res);
    } else if (req.method === "GET") {
      generateDefaultEdge.get(req, res);
    } else {
      res.writeHead(405);
    }
  },
);
const httpServer = createServer(app);
const io = new ServerWithUser(httpServer, {
  cors: {
    origin: "*",
  },
});

instrument(io, {
  auth: false,
});

httpServer.listen(port);
console.log(`WebSocket open on port ${port}`);

text(io);
browse(io);
imageInfo(io);
save(io);
upload(io);
