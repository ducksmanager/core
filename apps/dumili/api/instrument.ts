import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";

if (!process.env.SENTRY_DSN) {
  throw new Error("SENTRY_DSN is not set");
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  openTelemetryInstrumentations: [new SocketIoInstrumentation()],
});
