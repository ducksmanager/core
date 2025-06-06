import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import createHttpServer from "./http";
import createSocketServer from "./socket";
import type { Socket } from "socket.io";
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

export type UserServices<OptionalUser = false> = NamespaceProxyTarget<
  Socket<
    object,
    object,
    object,
    OptionalUser extends false ? { user: SessionUser } : { user?: SessionUser }
  >,
  Record<string, never>
>;

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
  tracesSampleRate: 1.0,
  openTelemetryInstrumentations: [new SocketIoInstrumentation()],
});

const io = createSocketServer(3001, createHttpServer());

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
presentationText(io);
publicCollection(io);
stats(io);
