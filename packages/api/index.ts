import * as Sentry from "@sentry/node";
import { instrument } from "@socket.io/admin-ui";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

import { getAppUpdates } from "./services/app";
import auth from "./services/auth";
import { OptionalAuthMiddleware } from "./services/auth/util";
import bookcase from "./services/bookcase";
import bookstores from "./services/bookstores";
import coa from "./services/coa";
import collection from "./services/collection";
import coverId from "./services/cover-id";
import edgecreator from "./services/edgecreator";
import edges from "./services/edges";
import events from "./services/events";
import feedback from "./services/feedback";
import globalStats from "./services/global-stats";
import login from "./services/login";
import presentationText from "./services/presentation-text";
import publicCollection from "./services/public-collection";
import stats from "./services/stats";
import { getDbStatus, getPastecSearchStatus, getPastecStatus } from "./services/status";

class ServerWithUser extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: SessionUser }
> { }

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

const httpServer = createServer(async (req, res) => {
  let data: { error: string } | object;
  switch (req.url) {
    case "/app/updates":
      const body: string[] = [];
      req
        .on('data', chunk => {
          body.push(chunk);
        })
        .on('end', () => {
          res.write(getAppUpdates(body.join('')));
          res.end();
        });
      return
    case "/status/db":
      data = await getDbStatus();
      break;
    case "/status/pastecsearch":
      data = await getPastecSearchStatus();
      break;
    case "/status/pastec":
      data = await getPastecStatus();
      break;
    default:
      res.writeHead(404);
      res.end();
      return;
  }

  res.writeHead("error" in data ? 500 : 200, { "Content-Type": "text/json" });
  res.write(JSON.stringify(data));
  res.end();
});
const io = new ServerWithUser(httpServer, {
  cors: {
    origin: true,
  },
});

instrument(io, {
  auth: false,
});

httpServer.listen(3000);
console.log("WebSocket open on port 3000");

io.use(OptionalAuthMiddleware);
io.use((_socket, next) => {
  next();

  // app.all(
  //   /^\/(edgecreator\/(publish|edgesprites)|notifications)|(edges\/(published))|(\/demo\/reset)|(bookstores\/(approve|refuse))|(presentation-text\/(approve|refuse))/,
  //   [checkUserIsAdmin]
  // );

  // app.all(/^\/edgecreator\/(.+)/, [
  //   authenticateToken,
  //   checkUserIsEdgeCreatorEditor,
  // ]);

  // app.all(/^\/global-stats\/user\/list$/, [
  //   authenticateToken,
  //   checkUserIsEdgeCreatorEditor,
  // ]);

  // app.all(/^\/collection\/(.+)/, authenticateToken);
  // app.all("/global-stats/user/collection/rarity", authenticateToken);
});

auth(io);
bookcase(io);
bookstores(io);
coa(io);
collection(io);
coverId(io);
edgecreator(io);
edges(io);
events(io);
feedback(io);
globalStats(io);
login(io);
presentationText(io);
publicCollection(io);
stats(io);
