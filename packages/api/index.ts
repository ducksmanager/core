import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";
import { instrument } from "@socket.io/admin-ui";
import cluster from "cluster";
import dotenv from "dotenv";
import createHttpServer from "./http";
import { cpus } from "os";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";

import type { SessionUser } from "~dm-types/SessionUser";

import { server as app } from "./services/app";
import { server as auth } from "./services/auth";
import { server as bookcase } from "./services/bookcase";
import {
  adminServer as bookstoresAdmin,
  server as bookstores,
} from "./services/bookstores";
import { server as coa } from "./services/coa";
import { server as collection } from "./services/collection";
import { server as coverId } from "./services/cover-id";
import { server as edgecreator } from "./services/edgecreator";
import { server as edges } from "./services/edges";
import { server as events } from "./services/events";
import { server as feedback } from "./services/feedback";
import { server as globalStats } from "./services/global-stats";
import { server as globalStatsUser } from "./services/global-stats-user";
import { server as presentationText } from "./services/presentation-text";
import { server as publicCollection } from "./services/public-collection";
import { server as stats } from "./services/stats";
import { loadModel, server as storySearch } from "./services/story-search";

export type UserServices<OptionalUser = false> = NamespaceProxyTarget<
  Socket<
    object,
    object,
    object,
    OptionalUser extends false ? { user: SessionUser } : { user?: SessionUser }
  >,
  Record<string, never>
>;

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

const isDebugMode = process.env.DEBUG === 'true';
const isLoadingModel = ! process.env.NODE_APP_INSTANCE;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  openTelemetryInstrumentations: [new SocketIoInstrumentation()],
});

console.log('process.env.NODE_APP_INSTANCE', process.env.NODE_APP_INSTANCE)
if (isLoadingModel) {
  loadModel();
}

if (!isDebugMode && cluster.isPrimary) {
  console.log('Starting cluster')
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code}), starting a new one`);
    setTimeout(() => {
      cluster.fork();
    }, 1000);
  });
} else {
  const httpServer = createHttpServer();
  httpServer.listen(3001);
  console.log("WebSocket open on port 3001 on worker", process.env.NODE_APP_INSTANCE);

  const io = new ServerWithUser(httpServer, {
    cors: {
      origin: true,
    },
  });

  instrument(io, {
    auth: false,
  });

  io.use((_socket, next) => {
    process.on("unhandledRejection", (reason: Error) => {
      console.error(reason);
      next(reason);
    });

    process.on("uncaughtException", (error: Error) => {
      console.error(error);
      next(error);
    });
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

  app(io);
  auth(io);
  bookcase(io);
  bookstores(io);
  bookstoresAdmin(io);
  coa(io);
  collection(io);
  coverId(io);
  edgecreator(io);
  edges(io);
  events(io);
  feedback(io);
  globalStats(io);
  globalStatsUser(io);
  storySearch(io);
  presentationText(io);
  publicCollection(io);
  stats(io);
}
