import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";

import { getSession, server as storySearch } from "./services/story-search";
import createSocketServer from "./socket";

dotenv.config({
  path: "./.env",
});

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    openTelemetryInstrumentations: [new SocketIoInstrumentation()],
  });
}

const storySearchIo = createSocketServer(3011);
storySearch(storySearchIo);

getSession();
