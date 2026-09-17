import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";

import { otlpSpanProcessors } from "./instrument-otlp";
import { getSession, server as storySearch } from "./services/story-search";
import createSocketServer from "./socket";

dotenv.config({
  path: "./.env",
});

if (process.env.SENTRY_DSN) {
  const client = Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    openTelemetryInstrumentations: [new SocketIoInstrumentation()],
    skipOpenTelemetrySetup: true,
  });
  if (client) {
    Sentry.initOpenTelemetry(client, { spanProcessors: otlpSpanProcessors() });
  }
}

const storySearchIo = createSocketServer(3011);
storySearch(storySearchIo);

getSession();
